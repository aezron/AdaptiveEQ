const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const crypto = require('crypto');

const app = express();
app.use(express.json());
app.use(express.static('.'));

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Session middleware
app.use(async (req, res, next) => {
  let sessionId = req.headers['x-session-id'];
  
  if (!sessionId) {
    sessionId = crypto.randomBytes(32).toString('hex');
    res.setHeader('x-session-id', sessionId);
  }
  
  try {
    let result = await pool.query('SELECT * FROM users WHERE session_id = $1', [sessionId]);
    
    if (result.rows.length === 0) {
      result = await pool.query(
        'INSERT INTO users (session_id) VALUES ($1) RETURNING *',
        [sessionId]
      );
    }
    
    req.user = result.rows[0];
    next();
  } catch (error) {
    console.error('Session error:', error);
    res.status(500).json({ error: 'Session error' });
  }
});

// Get all presets (user + factory)
app.get('/api/presets', async (req, res) => {
  try {
    const userPresets = await pool.query(
      'SELECT * FROM presets WHERE user_id = $1 AND is_factory = false ORDER BY created_at DESC',
      [req.user.id]
    );
    
    const factoryPresets = await pool.query(
      'SELECT * FROM presets WHERE is_factory = true ORDER BY name'
    );
    
    res.json({
      userPresets: userPresets.rows,
      factoryPresets: factoryPresets.rows
    });
  } catch (error) {
    console.error('Error fetching presets:', error);
    res.status(500).json({ error: 'Failed to fetch presets' });
  }
});

// Save new preset
app.post('/api/presets', async (req, res) => {
  try {
    const {
      name, description,
      lowEnabled, lowThreshold, lowRatio, lowAttack, lowRelease, lowCrossover,
      midEnabled, midThreshold, midRatio, midAttack, midRelease, midCrossover,
      highEnabled, highThreshold, highRatio, highAttack, highRelease,
      inputGain, outputGain, mix, sensitivity
    } = req.body;
    
    const result = await pool.query(`
      INSERT INTO presets (
        user_id, name, description,
        low_enabled, low_threshold, low_ratio, low_attack, low_release, low_crossover,
        mid_enabled, mid_threshold, mid_ratio, mid_attack, mid_release, mid_crossover,
        high_enabled, high_threshold, high_ratio, high_attack, high_release,
        input_gain, output_gain, mix, sensitivity
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
      RETURNING *
    `, [
      req.user.id, name, description,
      lowEnabled, lowThreshold, lowRatio, lowAttack, lowRelease, lowCrossover,
      midEnabled, midThreshold, midRatio, midAttack, midRelease, midCrossover,
      highEnabled, highThreshold, highRatio, highAttack, highRelease,
      inputGain, outputGain, mix, sensitivity
    ]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error saving preset:', error);
    res.status(500).json({ error: 'Failed to save preset' });
  }
});

// Delete preset
app.delete('/api/presets/:id', async (req, res) => {
  try {
    const presetId = parseInt(req.params.id);
    const result = await pool.query(
      'DELETE FROM presets WHERE id = $1 AND user_id = $2 AND is_factory = false RETURNING *',
      [presetId, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Preset not found or cannot be deleted' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting preset:', error);
    res.status(500).json({ error: 'Failed to delete preset' });
  }
});

// Get user settings
app.get('/api/settings', async (req, res) => {
  try {
    let result = await pool.query('SELECT * FROM user_settings WHERE user_id = $1', [req.user.id]);
    
    if (result.rows.length === 0) {
      result = await pool.query(
        'INSERT INTO user_settings (user_id) VALUES ($1) RETURNING *',
        [req.user.id]
      );
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update user settings
app.put('/api/settings', async (req, res) => {
  try {
    const { theme, autoSave, defaultVolume, lastPresetId } = req.body;
    
    const result = await pool.query(`
      UPDATE user_settings 
      SET theme = COALESCE($2, theme),
          auto_save = COALESCE($3, auto_save),
          default_volume = COALESCE($4, default_volume),
          last_preset_id = COALESCE($5, last_preset_id),
          updated_at = NOW()
      WHERE user_id = $1
      RETURNING *
    `, [req.user.id, theme, autoSave, defaultVolume, lastPresetId]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`AdaptiveEQ server running on port ${PORT}`);
});