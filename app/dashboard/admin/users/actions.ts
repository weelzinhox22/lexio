"use server"

import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function grantLifetimeAccess(userId: string) {
    try {
        const currentYear = new Date().getFullYear();
        const lifetimeEnd = new Date(currentYear + 100, 0, 1).toISOString(); // +100 years

        const { error } = await adminSupabase.from("subscriptions").upsert({
            user_id: userId,
            plan: "enterprise",     // Assuming enterprise is the ultimate plan
            status: "active",       // Mark status as active instead of trial
            trial_ends_at: null,    // No trial needed anymore
            current_period_start: new Date().toISOString(),
            current_period_end: lifetimeEnd,
            cancel_at_period_end: false
        }, { onConflict: "user_id" });

        if (error) throw error;
        revalidatePath("/dashboard/admin/users")
    } catch (error) {
        console.error("Erro ao conceder acesso vitalício:", error)
    }
}

export async function extendTrial(userId: string) {
    try {
        // Try to find existing sub
        const { data: sub } = await adminSupabase
            .from("subscriptions")
            .select("current_period_end")
            .eq("user_id", userId)
            .single();

        // Set base date to today or current end (which ever is further away)
        const baseDate = sub && new Date(sub.current_period_end) > new Date()
            ? new Date(sub.current_period_end)
            : new Date();

        baseDate.setDate(baseDate.getDate() + 30);

        const { error } = await adminSupabase.from("subscriptions").upsert({
            user_id: userId,
            plan: "basic",           // Give basic plan trial
            status: "trial",         // Keep as trial
            trial_ends_at: baseDate.toISOString(),
            current_period_start: new Date().toISOString(),
            current_period_end: baseDate.toISOString(),
            cancel_at_period_end: false
        }, { onConflict: "user_id" });

        if (error) throw error;
        revalidatePath("/dashboard/admin/users")
    } catch (error) {
        console.error("Erro ao estender prazo:", error)
    }
}
