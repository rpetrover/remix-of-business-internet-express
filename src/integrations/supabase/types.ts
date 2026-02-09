export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      abandoned_checkouts: {
        Row: {
          cart_snapshot: Json | null
          city: string | null
          converted: boolean
          converted_at: string | null
          created_at: string
          customer_name: string | null
          email: string
          follow_up_count: number
          gbraid: string | null
          gclid: string | null
          id: string
          landing_page: string | null
          last_follow_up_at: string | null
          monthly_price: number | null
          opted_out: boolean
          opted_out_at: string | null
          phone: string | null
          selected_plan: string | null
          selected_provider: string | null
          service_address: string | null
          speed: string | null
          state: string | null
          status: string
          updated_at: string
          utm_adgroup: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          wbraid: string | null
          zip: string | null
        }
        Insert: {
          cart_snapshot?: Json | null
          city?: string | null
          converted?: boolean
          converted_at?: string | null
          created_at?: string
          customer_name?: string | null
          email: string
          follow_up_count?: number
          gbraid?: string | null
          gclid?: string | null
          id?: string
          landing_page?: string | null
          last_follow_up_at?: string | null
          monthly_price?: number | null
          opted_out?: boolean
          opted_out_at?: string | null
          phone?: string | null
          selected_plan?: string | null
          selected_provider?: string | null
          service_address?: string | null
          speed?: string | null
          state?: string | null
          status?: string
          updated_at?: string
          utm_adgroup?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          wbraid?: string | null
          zip?: string | null
        }
        Update: {
          cart_snapshot?: Json | null
          city?: string | null
          converted?: boolean
          converted_at?: string | null
          created_at?: string
          customer_name?: string | null
          email?: string
          follow_up_count?: number
          gbraid?: string | null
          gclid?: string | null
          id?: string
          landing_page?: string | null
          last_follow_up_at?: string | null
          monthly_price?: number | null
          opted_out?: boolean
          opted_out_at?: string | null
          phone?: string | null
          selected_plan?: string | null
          selected_provider?: string | null
          service_address?: string | null
          speed?: string | null
          state?: string | null
          status?: string
          updated_at?: string
          utm_adgroup?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          wbraid?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      admin_otp_codes: {
        Row: {
          code: string
          created_at: string
          email: string
          expires_at: string
          id: string
          used: boolean
        }
        Insert: {
          code: string
          created_at?: string
          email: string
          expires_at: string
          id?: string
          used?: boolean
        }
        Update: {
          code?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          used?: boolean
        }
        Relationships: []
      }
      call_records: {
        Row: {
          call_sid: string | null
          callee_phone: string | null
          caller_phone: string | null
          conversation_id: string | null
          created_at: string
          customer_email: string | null
          customer_name: string | null
          direction: string
          duration_seconds: number | null
          first_user_utterance_detected: boolean | null
          id: string
          interruptions_count: number | null
          no_input_reprompt_used: boolean | null
          no_response_end: boolean | null
          recording_url: string | null
          related_checkout_id: string | null
          related_order_id: string | null
          started_speaking_before_user: boolean | null
          status: string
          summary: string | null
          time_to_first_agent_speech_ms: number | null
          time_to_first_user_speech_ms: number | null
          transcript: string | null
          updated_at: string
        }
        Insert: {
          call_sid?: string | null
          callee_phone?: string | null
          caller_phone?: string | null
          conversation_id?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          direction?: string
          duration_seconds?: number | null
          first_user_utterance_detected?: boolean | null
          id?: string
          interruptions_count?: number | null
          no_input_reprompt_used?: boolean | null
          no_response_end?: boolean | null
          recording_url?: string | null
          related_checkout_id?: string | null
          related_order_id?: string | null
          started_speaking_before_user?: boolean | null
          status?: string
          summary?: string | null
          time_to_first_agent_speech_ms?: number | null
          time_to_first_user_speech_ms?: number | null
          transcript?: string | null
          updated_at?: string
        }
        Update: {
          call_sid?: string | null
          callee_phone?: string | null
          caller_phone?: string | null
          conversation_id?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          direction?: string
          duration_seconds?: number | null
          first_user_utterance_detected?: boolean | null
          id?: string
          interruptions_count?: number | null
          no_input_reprompt_used?: boolean | null
          no_response_end?: boolean | null
          recording_url?: string | null
          related_checkout_id?: string | null
          related_order_id?: string | null
          started_speaking_before_user?: boolean | null
          status?: string
          summary?: string | null
          time_to_first_agent_speech_ms?: number | null
          time_to_first_user_speech_ms?: number | null
          transcript?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_records_related_checkout_id_fkey"
            columns: ["related_checkout_id"]
            isOneToOne: false
            referencedRelation: "abandoned_checkouts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_records_related_order_id_fkey"
            columns: ["related_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_contacts: {
        Row: {
          campaign_id: string
          created_at: string
          email: string
          id: string
          name: string | null
          sent_at: string | null
          status: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          email: string
          id?: string
          name?: string | null
          sent_at?: string | null
          status?: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_contacts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          body_html: string
          created_at: string
          failed_count: number | null
          id: string
          name: string
          scheduled_at: string | null
          sent_at: string | null
          sent_count: number | null
          status: string
          subject: string
          total_recipients: number | null
          updated_at: string
        }
        Insert: {
          body_html?: string
          created_at?: string
          failed_count?: number | null
          id?: string
          name: string
          scheduled_at?: string | null
          sent_at?: string | null
          sent_count?: number | null
          status?: string
          subject: string
          total_recipients?: number | null
          updated_at?: string
        }
        Update: {
          body_html?: string
          created_at?: string
          failed_count?: number | null
          id?: string
          name?: string
          scheduled_at?: string | null
          sent_at?: string | null
          sent_count?: number | null
          status?: string
          subject?: string
          total_recipients?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          bundle_components: string[] | null
          created_at: string
          features: string[]
          id: string
          is_bundle: boolean
          price: number
          product_name: string
          product_type: string
          speed: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bundle_components?: string[] | null
          created_at?: string
          features?: string[]
          id?: string
          is_bundle?: boolean
          price: number
          product_name: string
          product_type: string
          speed?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bundle_components?: string[] | null
          created_at?: string
          features?: string[]
          id?: string
          is_bundle?: boolean
          price?: number
          product_name?: string
          product_type?: string
          speed?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_ai_config: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          mode: string
          system_prompt: string
          training_examples: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          mode?: string
          system_prompt?: string
          training_examples?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          mode?: string
          system_prompt?: string
          training_examples?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      emails: {
        Row: {
          ai_auto_replied: boolean | null
          ai_draft: string | null
          body_html: string | null
          body_text: string | null
          created_at: string
          direction: string
          from_email: string
          from_name: string | null
          id: string
          resend_id: string | null
          status: string
          subject: string
          to_email: string
          to_name: string | null
          updated_at: string
        }
        Insert: {
          ai_auto_replied?: boolean | null
          ai_draft?: string | null
          body_html?: string | null
          body_text?: string | null
          created_at?: string
          direction: string
          from_email: string
          from_name?: string | null
          id?: string
          resend_id?: string | null
          status?: string
          subject?: string
          to_email: string
          to_name?: string | null
          updated_at?: string
        }
        Update: {
          ai_auto_replied?: boolean | null
          ai_draft?: string | null
          body_html?: string | null
          body_text?: string | null
          created_at?: string
          direction?: string
          from_email?: string
          from_name?: string | null
          id?: string
          resend_id?: string | null
          status?: string
          subject?: string
          to_email?: string
          to_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      follow_up_actions: {
        Row: {
          action_type: string
          checkout_id: string
          created_at: string
          executed_at: string | null
          id: string
          response_data: Json | null
          scheduled_at: string
          sequence_step: number
          status: string
          subject: string | null
        }
        Insert: {
          action_type: string
          checkout_id: string
          created_at?: string
          executed_at?: string | null
          id?: string
          response_data?: Json | null
          scheduled_at?: string
          sequence_step: number
          status?: string
          subject?: string | null
        }
        Update: {
          action_type?: string
          checkout_id?: string
          created_at?: string
          executed_at?: string | null
          id?: string
          response_data?: Json | null
          scheduled_at?: string
          sequence_step?: number
          status?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "follow_up_actions_checkout_id_fkey"
            columns: ["checkout_id"]
            isOneToOne: false
            referencedRelation: "abandoned_checkouts"
            referencedColumns: ["id"]
          },
        ]
      }
      gold_library: {
        Row: {
          call_id: string | null
          created_at: string
          duration_seconds: number | null
          id: string
          lead_id: string | null
          month: string
          notes: string | null
          outcome: string | null
          tags: string[] | null
        }
        Insert: {
          call_id?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          lead_id?: string | null
          month: string
          notes?: string | null
          outcome?: string | null
          tags?: string[] | null
        }
        Update: {
          call_id?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          lead_id?: string | null
          month?: string
          notes?: string | null
          outcome?: string | null
          tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "gold_library_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "call_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gold_library_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "outbound_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      intelisys_threads: {
        Row: {
          admin_email: string | null
          created_at: string
          customer_email: string | null
          id: string
          intelisys_email_id: string | null
          intelisys_from_email: string | null
          intelisys_reply_draft: string | null
          order_id: string | null
          outbound_email_id: string | null
          reply_email_id: string | null
          request_summary: string | null
          request_type: string
          status: string
          updated_at: string
        }
        Insert: {
          admin_email?: string | null
          created_at?: string
          customer_email?: string | null
          id?: string
          intelisys_email_id?: string | null
          intelisys_from_email?: string | null
          intelisys_reply_draft?: string | null
          order_id?: string | null
          outbound_email_id?: string | null
          reply_email_id?: string | null
          request_summary?: string | null
          request_type?: string
          status?: string
          updated_at?: string
        }
        Update: {
          admin_email?: string | null
          created_at?: string
          customer_email?: string | null
          id?: string
          intelisys_email_id?: string | null
          intelisys_from_email?: string | null
          intelisys_reply_draft?: string | null
          order_id?: string | null
          outbound_email_id?: string | null
          reply_email_id?: string | null
          request_summary?: string | null
          request_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "intelisys_threads_intelisys_email_id_fkey"
            columns: ["intelisys_email_id"]
            isOneToOne: false
            referencedRelation: "emails"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intelisys_threads_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intelisys_threads_outbound_email_id_fkey"
            columns: ["outbound_email_id"]
            isOneToOne: false
            referencedRelation: "emails"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intelisys_threads_reply_email_id_fkey"
            columns: ["reply_email_id"]
            isOneToOne: false
            referencedRelation: "emails"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_source_allocations: {
        Row: {
          conversion_rate: number | null
          cost_per_order: number | null
          created_at: string
          current_pct: number
          id: string
          max_pct: number
          min_pct: number
          source_name: string
          total_leads: number
          total_orders: number
          updated_at: string
        }
        Insert: {
          conversion_rate?: number | null
          cost_per_order?: number | null
          created_at?: string
          current_pct?: number
          id?: string
          max_pct?: number
          min_pct?: number
          source_name: string
          total_leads?: number
          total_orders?: number
          updated_at?: string
        }
        Update: {
          conversion_rate?: number | null
          cost_per_order?: number | null
          created_at?: string
          current_pct?: number
          id?: string
          max_pct?: number
          min_pct?: number
          source_name?: string
          total_leads?: number
          total_orders?: number
          updated_at?: string
        }
        Relationships: []
      }
      lead_status_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          id: string
          lead_id: string
          lead_type: string
          new_status: string
          old_status: string | null
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          lead_id: string
          lead_type?: string
          new_status: string
          old_status?: string | null
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          lead_id?: string
          lead_type?: string
          new_status?: string
          old_status?: string | null
        }
        Relationships: []
      }
      opener_weights: {
        Row: {
          close_rate: number | null
          created_at: string
          discovery_completion_rate: number | null
          engagement_rate: number | null
          id: string
          is_paused: boolean
          total_answered: number
          total_calls: number
          updated_at: string
          variant: string
          weight: number
        }
        Insert: {
          close_rate?: number | null
          created_at?: string
          discovery_completion_rate?: number | null
          engagement_rate?: number | null
          id?: string
          is_paused?: boolean
          total_answered?: number
          total_calls?: number
          updated_at?: string
          variant: string
          weight?: number
        }
        Update: {
          close_rate?: number | null
          created_at?: string
          discovery_completion_rate?: number | null
          engagement_rate?: number | null
          id?: string
          is_paused?: boolean
          total_answered?: number
          total_calls?: number
          updated_at?: string
          variant?: string
          weight?: number
        }
        Relationships: []
      }
      optimization_changelog: {
        Row: {
          after_json: Json | null
          approved_at: string | null
          approved_by: string | null
          before_json: Json | null
          change_category: string
          change_type: string
          created_at: string
          id: string
          metrics_snapshot: Json | null
          reason: string | null
          rolled_back_at: string | null
          status: string
          title: string
        }
        Insert: {
          after_json?: Json | null
          approved_at?: string | null
          approved_by?: string | null
          before_json?: Json | null
          change_category?: string
          change_type: string
          created_at?: string
          id?: string
          metrics_snapshot?: Json | null
          reason?: string | null
          rolled_back_at?: string | null
          status?: string
          title: string
        }
        Update: {
          after_json?: Json | null
          approved_at?: string | null
          approved_by?: string | null
          before_json?: Json | null
          change_category?: string
          change_type?: string
          created_at?: string
          id?: string
          metrics_snapshot?: Json | null
          reason?: string | null
          rolled_back_at?: string | null
          status?: string
          title?: string
        }
        Relationships: []
      }
      orchestrator_reports: {
        Row: {
          audit_results: Json | null
          auto_applied: Json | null
          bottleneck: string | null
          created_at: string
          experiments: Json | null
          id: string
          metrics: Json
          needs_approval: Json | null
          recommendations: Json | null
          report_date: string
          report_type: string
        }
        Insert: {
          audit_results?: Json | null
          auto_applied?: Json | null
          bottleneck?: string | null
          created_at?: string
          experiments?: Json | null
          id?: string
          metrics?: Json
          needs_approval?: Json | null
          recommendations?: Json | null
          report_date: string
          report_type: string
        }
        Update: {
          audit_results?: Json | null
          auto_applied?: Json | null
          bottleneck?: string | null
          created_at?: string
          experiments?: Json | null
          id?: string
          metrics?: Json
          needs_approval?: Json | null
          recommendations?: Json | null
          report_date?: string
          report_type?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          channel: string
          city: string
          contact_email: string
          contact_phone: string
          country: string
          created_at: string
          customer_name: string
          gbraid: string | null
          gclid: string | null
          id: string
          intelisys_email_sent: boolean
          intelisys_sent_at: string | null
          landing_page: string | null
          monthly_price: number | null
          notes: string | null
          porting_bill_url: string | null
          preferred_provider: string | null
          resend_id: string | null
          selected_plan: string | null
          service_address: string
          service_type: string
          speed: string | null
          state: string
          status: string
          updated_at: string
          utm_adgroup: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          wbraid: string | null
          zip: string
        }
        Insert: {
          channel?: string
          city: string
          contact_email: string
          contact_phone: string
          country?: string
          created_at?: string
          customer_name: string
          gbraid?: string | null
          gclid?: string | null
          id?: string
          intelisys_email_sent?: boolean
          intelisys_sent_at?: string | null
          landing_page?: string | null
          monthly_price?: number | null
          notes?: string | null
          porting_bill_url?: string | null
          preferred_provider?: string | null
          resend_id?: string | null
          selected_plan?: string | null
          service_address: string
          service_type?: string
          speed?: string | null
          state: string
          status?: string
          updated_at?: string
          utm_adgroup?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          wbraid?: string | null
          zip: string
        }
        Update: {
          channel?: string
          city?: string
          contact_email?: string
          contact_phone?: string
          country?: string
          created_at?: string
          customer_name?: string
          gbraid?: string | null
          gclid?: string | null
          id?: string
          intelisys_email_sent?: boolean
          intelisys_sent_at?: string | null
          landing_page?: string | null
          monthly_price?: number | null
          notes?: string | null
          porting_bill_url?: string | null
          preferred_provider?: string | null
          resend_id?: string | null
          selected_plan?: string | null
          service_address?: string
          service_type?: string
          speed?: string | null
          state?: string
          status?: string
          updated_at?: string
          utm_adgroup?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          wbraid?: string | null
          zip?: string
        }
        Relationships: []
      }
      outbound_campaign_runs: {
        Row: {
          created_at: string
          id: string
          name: string
          status: string
          total_calls_made: number | null
          total_conversions: number | null
          total_emails_sent: number | null
          total_leads_found: number | null
          updated_at: string
          zip_codes: string[]
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          status?: string
          total_calls_made?: number | null
          total_conversions?: number | null
          total_emails_sent?: number | null
          total_leads_found?: number | null
          updated_at?: string
          zip_codes?: string[]
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          status?: string
          total_calls_made?: number | null
          total_conversions?: number | null
          total_emails_sent?: number | null
          total_leads_found?: number | null
          updated_at?: string
          zip_codes?: string[]
        }
        Relationships: []
      }
      outbound_leads: {
        Row: {
          address: string | null
          business_name: string
          business_type: string | null
          call_outcome: string | null
          call_recording_url: string | null
          call_sid: string | null
          call_transcript: string | null
          callback_time: string | null
          campaign_status: string
          city: string | null
          converted_order_id: string | null
          created_at: string
          decision_maker_name: string | null
          decision_maker_reached: boolean | null
          decision_maker_title: string | null
          discovery_batch: string | null
          drip_step: number
          email: string | null
          fiber_launch_source: string | null
          gatekeeper_encountered: boolean | null
          google_place_id: string | null
          id: string
          is_fiber_launch_area: boolean | null
          last_call_at: string | null
          last_email_sent_at: string | null
          latitude: number | null
          longitude: number | null
          next_followup_datetime: string | null
          notes: string | null
          objections_triggered: string[] | null
          opening_variant: string | null
          phone: string | null
          qualifying_answers: Json | null
          sms_consent: boolean | null
          state: string | null
          updated_at: string
          website: string | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          business_name: string
          business_type?: string | null
          call_outcome?: string | null
          call_recording_url?: string | null
          call_sid?: string | null
          call_transcript?: string | null
          callback_time?: string | null
          campaign_status?: string
          city?: string | null
          converted_order_id?: string | null
          created_at?: string
          decision_maker_name?: string | null
          decision_maker_reached?: boolean | null
          decision_maker_title?: string | null
          discovery_batch?: string | null
          drip_step?: number
          email?: string | null
          fiber_launch_source?: string | null
          gatekeeper_encountered?: boolean | null
          google_place_id?: string | null
          id?: string
          is_fiber_launch_area?: boolean | null
          last_call_at?: string | null
          last_email_sent_at?: string | null
          latitude?: number | null
          longitude?: number | null
          next_followup_datetime?: string | null
          notes?: string | null
          objections_triggered?: string[] | null
          opening_variant?: string | null
          phone?: string | null
          qualifying_answers?: Json | null
          sms_consent?: boolean | null
          state?: string | null
          updated_at?: string
          website?: string | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          business_name?: string
          business_type?: string | null
          call_outcome?: string | null
          call_recording_url?: string | null
          call_sid?: string | null
          call_transcript?: string | null
          callback_time?: string | null
          campaign_status?: string
          city?: string | null
          converted_order_id?: string | null
          created_at?: string
          decision_maker_name?: string | null
          decision_maker_reached?: boolean | null
          decision_maker_title?: string | null
          discovery_batch?: string | null
          drip_step?: number
          email?: string | null
          fiber_launch_source?: string | null
          gatekeeper_encountered?: boolean | null
          google_place_id?: string | null
          id?: string
          is_fiber_launch_area?: boolean | null
          last_call_at?: string | null
          last_email_sent_at?: string | null
          latitude?: number | null
          longitude?: number | null
          next_followup_datetime?: string | null
          notes?: string | null
          objections_triggered?: string[] | null
          opening_variant?: string | null
          phone?: string | null
          qualifying_answers?: Json | null
          sms_consent?: boolean | null
          state?: string | null
          updated_at?: string
          website?: string | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outbound_leads_converted_order_id_fkey"
            columns: ["converted_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      spectrum_newsroom_scans: {
        Row: {
          article_title: string | null
          article_url: string
          id: string
          leads_discovered: number | null
          locations_found: Json | null
          publish_date: string | null
          scanned_at: string
          zip_codes_extracted: string[] | null
        }
        Insert: {
          article_title?: string | null
          article_url: string
          id?: string
          leads_discovered?: number | null
          locations_found?: Json | null
          publish_date?: string | null
          scanned_at?: string
          zip_codes_extracted?: string[] | null
        }
        Update: {
          article_title?: string | null
          article_url?: string
          id?: string
          leads_discovered?: number | null
          locations_found?: Json | null
          publish_date?: string | null
          scanned_at?: string
          zip_codes_extracted?: string[] | null
        }
        Relationships: []
      }
      transcript_insights: {
        Row: {
          call_id: string | null
          created_at: string
          failing_phrases: string[] | null
          hangup_category: string | null
          id: string
          last_agent_sentence: string | null
          last_prospect_sentence: string | null
          lead_id: string | null
          notes: string | null
          objection_detected: string[] | null
          sentiment_shift: string | null
          trigger_line: string | null
          winning_phrases: string[] | null
        }
        Insert: {
          call_id?: string | null
          created_at?: string
          failing_phrases?: string[] | null
          hangup_category?: string | null
          id?: string
          last_agent_sentence?: string | null
          last_prospect_sentence?: string | null
          lead_id?: string | null
          notes?: string | null
          objection_detected?: string[] | null
          sentiment_shift?: string | null
          trigger_line?: string | null
          winning_phrases?: string[] | null
        }
        Update: {
          call_id?: string | null
          created_at?: string
          failing_phrases?: string[] | null
          hangup_category?: string | null
          id?: string
          last_agent_sentence?: string | null
          last_prospect_sentence?: string | null
          lead_id?: string | null
          notes?: string | null
          objection_detected?: string[] | null
          sentiment_shift?: string | null
          trigger_line?: string | null
          winning_phrases?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "transcript_insights_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "call_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transcript_insights_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "outbound_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      handle_opt_out: { Args: { checkout_email: string }; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
