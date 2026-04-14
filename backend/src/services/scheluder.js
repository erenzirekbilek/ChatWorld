const { pool } = require('../db');

   const processPendingLetters = async () => {
     try {
       const result = await pool.query(
         `UPDATE letters
          SET delivered_at = NOW()
          WHERE delivered_at IS NULL
          AND sent_at + INTERVAL '1 minute' <= NOW()
          RETURNING id, sender_id, receiver_id`
       );

       if (result.rowCount > 0) {
         console.log(`\n✅ [SCHEDULER] ${result.rowCount} mektup teslim edildi!`);
         result.rows.forEach((letter) => {
           console.log(`   📮 Mektup ${letter.id.substring(0, 8)}... teslim edildi`);
         });
       }
     } catch (err) {
       console.error('❌ Scheduler error:', err.message);
     }
   };

   const startScheduler = () => {
     console.log('⏰ Letter Scheduler başlatılıyor...');
     setInterval(processPendingLetters, 30 * 1000);
     processPendingLetters();
     console.log('✅ Scheduler aktif (her 30 saniyede bir kontrol)');
   };

   module.exports = {
     startScheduler,
     processPendingLetters
   };