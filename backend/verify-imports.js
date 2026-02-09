try {
    console.log('Testing import from controllers/authController.js...');
    await import('./controllers/authController.js');
    console.log('✅ authController.js imported successfully');
} catch (error) {
    console.error('❌ Failed to import authController.js:', error.message);
    if (error.stack) console.error(error.stack);
}

try {
    console.log('Testing import from routes/authRoutes.js...');
    await import('./routes/authRoutes.js');
    console.log('✅ authRoutes.js imported successfully');
} catch (error) {
    console.error('❌ Failed to import authRoutes.js:', error.message);
}
