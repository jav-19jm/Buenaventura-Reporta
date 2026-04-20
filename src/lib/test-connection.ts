import { supabase } from './supabase';

/**
 * Probar conexión a Supabase
 * Esta función verifica que la conexión funcione correctamente
 */
export async function testSupabaseConnection() {
  console.log('🔍 Probando conexión a Supabase...');

  try {
    // Probar conexión simple
    const { data, error } = await supabase
      .from('entities')
      .select('name, slug')
      .limit(1);

    if (error) {
      console.error('❌ Error en conexión:', error.message);
      console.error('💡 Asegúrate de que las tablas estén creadas en Supabase');
      return { success: false, error: error.message };
    }

    console.log('✅ Conexión a Supabase exitosa!');
    if (data && data.length > 0) {
      console.log('📊 Datos de prueba:', data[0]);
    }
    return { success: true, data };
  } catch (error: any) {
    console.error('❌ Error inesperado:', error.message);
    return { success: false, error: error.message };
  }
}

// Ejecutar prueba automáticamente
setTimeout(() => {
  testSupabaseConnection().catch(console.error);
}, 1000);
