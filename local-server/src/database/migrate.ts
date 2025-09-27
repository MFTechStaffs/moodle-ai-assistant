#!/usr/bin/env ts-node

import { Database } from './Database';
import path from 'path';

async function migrate() {
    console.log('🔄 Starting database migration...');
    
    try {
        const dbPath = path.join(__dirname, '../../../local-server/data/moodle-memory.db');
        const db = new Database(dbPath);
        
        console.log('✅ Database migration completed successfully');
        console.log(`📁 Database location: ${dbPath}`);
        
        // Get initial stats
        const stats = await db.getStats();
        console.log('📊 Initial database stats:', stats);
        
        await db.close();
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

// Run migration if called directly
if (require.main === module) {
    migrate();
}

export { migrate };