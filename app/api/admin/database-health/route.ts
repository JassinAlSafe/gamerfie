import { NextResponse } from "next/server";
import { validateAdminApiAccess } from "@/app/api/lib/admin-auth";
import { createClient } from "@/utils/supabase/server";

// Force dynamic rendering due to cookies and request.url usage
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Use centralized admin validation following 2025 best practices
    const adminAuth = await validateAdminApiAccess();
    
    if (!adminAuth.success) {
      return adminAuth.response;
    }
    
    const { supabase } = adminAuth;

    const { searchParams } = new URL(request.url);
    const checkType = searchParams.get('type') || 'all';

    const results: any = {};

    try {
      // Quick health check
      if (checkType === 'all' || checkType === 'quick') {
        const { data: quickCheck, error: quickError } = await supabase
          .rpc('quick_health_check');
        
        if (!quickError) {
          results.quickCheck = quickCheck;
        }
      }

      // Detailed health check
      if (checkType === 'all' || checkType === 'detailed') {
        const { data: healthCheck, error: healthError } = await supabase
          .rpc('database_health_check');
        
        if (!healthError) {
          results.healthChecks = healthCheck;
        }
      }

      // System status
      if (checkType === 'all' || checkType === 'system') {
        const { data: systemStatus, error: systemError } = await supabase
          .from('system_status')
          .select('*');
        
        if (!systemError) {
          results.systemStatus = systemStatus;
        }
      }

      // Database statistics
      if (checkType === 'all' || checkType === 'stats') {
        const { data: dbStats, error: statsError } = await supabase
          .from('database_statistics')
          .select('*');
        
        if (!statsError) {
          results.statistics = dbStats;
        }
      }

      // Performance metrics
      if (checkType === 'all' || checkType === 'performance') {
        const { data: performance, error: perfError } = await supabase
          .from('database_performance_metrics')
          .select('*');
        
        if (!perfError) {
          results.performance = performance;
        }
      }

      // Data consistency check
      if (checkType === 'all' || checkType === 'consistency') {
        const { data: consistency, error: consistencyError } = await supabase
          .rpc('check_data_consistency');
        
        if (!consistencyError) {
          results.consistency = consistency;
        }
      }

      return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        checkType,
        data: results
      });

    } catch (functionError) {
      console.error('Database function error:', functionError);
      return NextResponse.json({
        success: false,
        error: 'Some database functions may not be available',
        data: results,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Database health check error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to perform health check',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated and is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { action } = await request.json();

    let result;
    switch (action) {
      case 'cleanup_expired_data':
        const { data: cleanupResult, error: cleanupError } = await supabase
          .rpc('cleanup_expired_data');
        if (cleanupError) throw cleanupError;
        result = { action, result: cleanupResult };
        break;

      case 'refresh_user_journal_stats':
        const { data: refreshResult, error: refreshError } = await supabase
          .rpc('refresh_user_journal_stats');
        if (refreshError) throw refreshError;
        result = { action, result: refreshResult };
        break;

      case 'daily_maintenance':
        const { data: maintenanceResult, error: maintenanceError } = await supabase
          .rpc('daily_maintenance');
        if (maintenanceError) throw maintenanceError;
        result = { action, result: maintenanceResult };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: result
    });

  } catch (error) {
    console.error('Database maintenance action error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to perform maintenance action',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 