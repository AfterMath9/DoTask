
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TeamInvitationRequest {
  email: string;
  fullName: string;
  role: string;
  inviterName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName, role, inviterName }: TeamInvitationRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "TaskFlow AI <onboarding@resend.dev>",
      to: [email],
      subject: "You've been invited to join TaskFlow AI!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #333; margin-bottom: 20px;">Welcome to TaskFlow AI!</h1>
            <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
              Hi ${fullName},
            </p>
            <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
              ${inviterName} has invited you to join their team on TaskFlow AI as a <strong>${role}</strong>.
            </p>
            <p style="color: #666; font-size: 16px; margin-bottom: 30px;">
              TaskFlow AI is a powerful task management platform that helps teams organize, track, and complete their projects efficiently with AI-powered workflow management.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${Deno.env.get("SITE_URL") || "https://your-app-url.com"}" 
                 style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Join Team
              </a>
            </div>
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              If you don't want to receive these emails, you can ignore this invitation.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              This invitation was sent by TaskFlow AI on behalf of ${inviterName}
            </p>
          </div>
        </div>
      `,
    });

    console.log("Team invitation sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-team-invitation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
