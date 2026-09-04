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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          created_at: string
          date_achieved: string | null
          description: string | null
          id: string
          organization: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_achieved?: string | null
          description?: string | null
          id?: string
          organization?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_achieved?: string | null
          description?: string | null
          id?: string
          organization?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      app_config: {
        Row: {
          created_at: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      business_achievements: {
        Row: {
          achieved_date: string | null
          business_id: string
          created_at: string | null
          description: string | null
          display_order: number | null
          icon_type: string | null
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          achieved_date?: string | null
          business_id: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon_type?: string | null
          id?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          achieved_date?: string | null
          business_id?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon_type?: string | null
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_achievements_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "user_businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      business_category_mapping: {
        Row: {
          business_id: string
          category_id: string
          created_at: string | null
          id: string
          is_primary: boolean | null
          subcategory_id: string | null
        }
        Insert: {
          business_id: string
          category_id: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          subcategory_id?: string | null
        }
        Update: {
          business_id?: string
          category_id?: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          subcategory_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_category_mapping_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "business_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_category_mapping_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "business_subcategories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_business_category_mapping_business_id"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "user_businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_contact: {
        Row: {
          business_id: string
          contact_type: string
          contact_type_id: string | null
          contact_value: string
          created_at: string | null
          id: string
          is_primary: boolean | null
          is_public: boolean | null
          updated_at: string | null
        }
        Insert: {
          business_id: string
          contact_type: string
          contact_type_id?: string | null
          contact_value: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          is_public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          contact_type?: string
          contact_type_id?: string | null
          contact_value?: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          is_public?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_contact_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "user_businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_contact_contact_type_id_fkey"
            columns: ["contact_type_id"]
            isOneToOne: false
            referencedRelation: "contact_types"
            referencedColumns: ["id"]
          },
        ]
      }
      business_gallery: {
        Row: {
          business_id: string
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          image_type: string | null
          image_url: string
          is_primary: boolean | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_type?: string | null
          image_url: string
          is_primary?: boolean | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_type?: string | null
          image_url?: string
          is_primary?: boolean | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_gallery_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "user_businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_images: {
        Row: {
          business_id: string
          caption: string | null
          created_at: string
          display_order: number | null
          id: string
          image_url: string
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          business_id: string
          caption?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_url: string
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          business_id?: string
          caption?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_business_images_business_id"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "user_businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_links: {
        Row: {
          business_id: string
          created_at: string
          display_text: string | null
          id: string
          platform: string
          platform_id: string | null
          updated_at: string
          url: string
        }
        Insert: {
          business_id: string
          created_at?: string
          display_text?: string | null
          id?: string
          platform: string
          platform_id?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          business_id?: string
          created_at?: string
          display_text?: string | null
          id?: string
          platform?: string
          platform_id?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_links_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "user_businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_links_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "social_platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      business_locations: {
        Row: {
          address: string | null
          business_id: string
          city: string | null
          city_id: string | null
          country: string | null
          country_id: string | null
          created_at: string
          id: string
          is_primary: boolean | null
          location_name: string
          state: string | null
          state_id: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          business_id: string
          city?: string | null
          city_id?: string | null
          country?: string | null
          country_id?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean | null
          location_name: string
          state?: string | null
          state_id?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          business_id?: string
          city?: string | null
          city_id?: string | null
          country?: string | null
          country_id?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean | null
          location_name?: string
          state?: string | null
          state_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_locations_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_locations_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_locations_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_business_locations_business_id"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "user_businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_metrics: {
        Row: {
          business_id: string
          created_at: string | null
          display_order: number | null
          id: string
          is_public: boolean | null
          metric_period: string | null
          metric_type: string
          metric_unit: string | null
          metric_value: number | null
          updated_at: string | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_public?: boolean | null
          metric_period?: string | null
          metric_type: string
          metric_unit?: string | null
          metric_value?: number | null
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_public?: boolean | null
          metric_period?: string | null
          metric_type?: string
          metric_unit?: string | null
          metric_value?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_metrics_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "user_businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_reviews: {
        Row: {
          business_id: string
          content: string
          created_at: string | null
          helpful_count: number | null
          id: string
          is_verified_purchase: boolean | null
          rating: number
          response_date: string | null
          response_from_owner: string | null
          reviewer_id: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          business_id: string
          content: string
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_verified_purchase?: boolean | null
          rating: number
          response_date?: string | null
          response_from_owner?: string | null
          reviewer_id: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          content?: string
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_verified_purchase?: boolean | null
          rating?: number
          response_date?: string | null
          response_from_owner?: string | null
          reviewer_id?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "user_businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      business_services: {
        Row: {
          business_id: string
          category_id: string | null
          created_at: string
          delivery_method: string[] | null
          description: string | null
          display_order: number | null
          id: string
          price_range: string | null
          service_name: string
          updated_at: string
        }
        Insert: {
          business_id: string
          category_id?: string | null
          created_at?: string
          delivery_method?: string[] | null
          description?: string | null
          display_order?: number | null
          id?: string
          price_range?: string | null
          service_name: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          category_id?: string | null
          created_at?: string
          delivery_method?: string[] | null
          description?: string | null
          display_order?: number | null
          id?: string
          price_range?: string | null
          service_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_business_services_business_id"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "user_businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_sizes: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          display_order: number | null
          employee_range: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          employee_range?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          employee_range?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      business_subcategories: {
        Row: {
          category_id: string
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          category_id: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "business_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      business_team_members: {
        Row: {
          added_by: string | null
          business_id: string
          created_at: string
          id: string
          is_business_admin: boolean
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          added_by?: string | null
          business_id: string
          created_at?: string
          id?: string
          is_business_admin?: boolean
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          added_by?: string | null
          business_id?: string
          created_at?: string
          id?: string
          is_business_admin?: boolean
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_team_members_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "user_businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_business_team_members_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      career_history: {
        Row: {
          city_id: string | null
          company_name: string
          country_id: string | null
          created_at: string
          current_position: boolean | null
          description: string | null
          end_date: string | null
          id: string
          location: string | null
          location_city: string | null
          location_country: string | null
          location_state: string | null
          position: string
          start_date: string
          state_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          city_id?: string | null
          company_name: string
          country_id?: string | null
          created_at?: string
          current_position?: boolean | null
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          location_city?: string | null
          location_country?: string | null
          location_state?: string | null
          position: string
          start_date: string
          state_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          city_id?: string | null
          company_name?: string
          country_id?: string | null
          created_at?: string
          current_position?: boolean | null
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          location_city?: string | null
          location_country?: string | null
          location_state?: string | null
          position?: string
          start_date?: string
          state_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_history_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "career_history_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "career_history_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "career_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      cities: {
        Row: {
          country_id: string
          created_at: string | null
          display_name: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          is_popular: boolean | null
          name: string
          state_id: string | null
          updated_at: string | null
        }
        Insert: {
          country_id: string
          created_at?: string | null
          display_name?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name: string
          state_id?: string | null
          updated_at?: string | null
        }
        Update: {
          country_id?: string
          created_at?: string | null
          display_name?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name?: string
          state_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cities_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cities_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_types: {
        Row: {
          code: string
          created_at: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      contribution_types: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      contributions: {
        Row: {
          contribution_type: string | null
          contribution_type_id: string | null
          created_at: string
          currency: string | null
          currency_id: string | null
          current_contribution: boolean | null
          description: string | null
          end_date: string | null
          id: string
          organization_name: string
          role: string | null
          start_date: string | null
          updated_at: string
          user_id: string
          value_amount: number | null
          value_private: boolean | null
        }
        Insert: {
          contribution_type?: string | null
          contribution_type_id?: string | null
          created_at?: string
          currency?: string | null
          currency_id?: string | null
          current_contribution?: boolean | null
          description?: string | null
          end_date?: string | null
          id?: string
          organization_name: string
          role?: string | null
          start_date?: string | null
          updated_at?: string
          user_id: string
          value_amount?: number | null
          value_private?: boolean | null
        }
        Update: {
          contribution_type?: string | null
          contribution_type_id?: string | null
          created_at?: string
          currency?: string | null
          currency_id?: string | null
          current_contribution?: boolean | null
          description?: string | null
          end_date?: string | null
          id?: string
          organization_name?: string
          role?: string | null
          start_date?: string | null
          updated_at?: string
          user_id?: string
          value_amount?: number | null
          value_private?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "contributions_contribution_type_id_fkey"
            columns: ["contribution_type_id"]
            isOneToOne: false
            referencedRelation: "contribution_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contributions_currency_id_fkey"
            columns: ["currency_id"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contributions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          is_group: boolean
          last_message_at: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_group?: boolean
          last_message_at?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_group?: boolean
          last_message_at?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      countries: {
        Row: {
          code: string
          created_at: string | null
          display_name: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          display_name?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          display_name?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      currencies: {
        Row: {
          code: string
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          symbol: string | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          symbol?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          symbol?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      education_levels: {
        Row: {
          code: string
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      employee_ranges: {
        Row: {
          code: string
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          max_employees: number | null
          min_employees: number | null
          name: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          max_employees?: number | null
          min_employees?: number | null
          name: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          max_employees?: number | null
          min_employees?: number | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          edited_at: string | null
          id: string
          message_type: string
          reply_to_id: string | null
          sender_id: string
          updated_at: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          edited_at?: string | null
          id?: string
          message_type?: string
          reply_to_id?: string | null
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          edited_at?: string | null
          id?: string
          message_type?: string
          reply_to_id?: string | null
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_analytics: {
        Row: {
          created_at: string | null
          device_info: Json | null
          event_type: string
          id: string
          metadata: Json | null
          session_id: string | null
          step_index: number | null
          step_name: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          event_type: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          step_index?: number | null
          step_name?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          event_type?: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          step_index?: number | null
          step_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      onboarding_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          draft_data: Json | null
          id: string
          is_completed: boolean | null
          is_validated: boolean | null
          last_saved_at: string | null
          started_at: string | null
          step_index: number
          step_name: string
          time_spent_seconds: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          draft_data?: Json | null
          id?: string
          is_completed?: boolean | null
          is_validated?: boolean | null
          last_saved_at?: string | null
          started_at?: string | null
          step_index: number
          step_name: string
          time_spent_seconds?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          draft_data?: Json | null
          id?: string
          is_completed?: boolean | null
          is_validated?: boolean | null
          last_saved_at?: string | null
          started_at?: string | null
          step_index?: number
          step_name?: string
          time_spent_seconds?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ownership_types: {
        Row: {
          code: string
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      price_ranges: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profile_visibility_types: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_thumbnail_url: string | null
          avatar_url: string | null
          bio: string | null
          birthday: string | null
          business_intent: string | null
          city_id: string | null
          clerk_user_id: string | null
          country_id: string | null
          course: string | null
          created_at: string
          email: string
          full_name: string | null
          graduation_year: number | null
          id: string
          is_seed_data: boolean | null
          is_verified: boolean | null
          location: string | null
          location_city: string | null
          location_country: string | null
          location_state: string | null
          profile_completed: boolean | null
          profile_visibility:
            | Database["public"]["Enums"]["profile_visibility"]
            | null
          profile_visibility_id: string | null
          required_steps_completed: boolean | null
          state_id: string | null
          tags: string[] | null
          updated_at: string
          user_id: string
          hide_email: boolean | null
          hide_location: boolean | null
          hide_graduation_year: boolean | null
          hide_businesses: boolean | null
        }
        Insert: {
          avatar_thumbnail_url?: string | null
          avatar_url?: string | null
          bio?: string | null
          birthday?: string | null
          business_intent?: string | null
          city_id?: string | null
          clerk_user_id?: string | null
          country_id?: string | null
          course?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          graduation_year?: number | null
          id?: string
          is_seed_data?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          location_city?: string | null
          location_country?: string | null
          location_state?: string | null
          profile_completed?: boolean | null
          profile_visibility?:
            | Database["public"]["Enums"]["profile_visibility"]
            | null
          profile_visibility_id?: string | null
          required_steps_completed?: boolean | null
          state_id?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
          hide_email?: boolean | null
          hide_location?: boolean | null
          hide_graduation_year?: boolean | null
          hide_businesses?: boolean | null
        }
        Update: {
          avatar_thumbnail_url?: string | null
          avatar_url?: string | null
          bio?: string | null
          birthday?: string | null
          business_intent?: string | null
          city_id?: string | null
          clerk_user_id?: string | null
          country_id?: string | null
          course?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          graduation_year?: number | null
          id?: string
          is_seed_data?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          location_city?: string | null
          location_country?: string | null
          location_state?: string | null
          profile_completed?: boolean | null
          profile_visibility?:
            | Database["public"]["Enums"]["profile_visibility"]
            | null
          profile_visibility_id?: string | null
          required_steps_completed?: boolean | null
          state_id?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
          hide_email?: boolean | null
          hide_location?: boolean | null
          hide_graduation_year?: boolean | null
          hide_businesses?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_profile_visibility_id_fkey"
            columns: ["profile_visibility_id"]
            isOneToOne: false
            referencedRelation: "profile_visibility_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
        ]
      }
      programmes: {
        Row: {
          code: string
          created_at: string | null
          department: string | null
          display_order: number | null
          education_level_id: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          department?: string | null
          display_order?: number | null
          education_level_id?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          department?: string | null
          display_order?: number | null
          education_level_id?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "programmes_education_level_id_fkey"
            columns: ["education_level_id"]
            isOneToOne: false
            referencedRelation: "education_levels"
            referencedColumns: ["id"]
          },
        ]
      }
      service_categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      social_platforms: {
        Row: {
          base_url: string | null
          code: string
          created_at: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          base_url?: string | null
          code: string
          created_at?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          base_url?: string | null
          code?: string
          created_at?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      states: {
        Row: {
          code: string | null
          country_id: string
          created_at: string | null
          display_name: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          code?: string | null
          country_id: string
          created_at?: string | null
          display_name?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          code?: string | null
          country_id?: string
          created_at?: string | null
          display_name?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "states_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      user_businesses: {
        Row: {
          banner_thumbnail_url: string | null
          banner_url: string | null
          business_name: string
          business_registration_number: string | null
          business_size: string | null
          business_size_id: string | null
          city_id: string | null
          country_id: string | null
          created_at: string
          current_business: boolean | null
          description: string | null
          employee_count_range: string | null
          employee_range_id: string | null
          end_date: string | null
          featured_image_url: string | null
          id: string
          industry: string | null
          location: string | null
          location_city: string | null
          location_country: string | null
          location_state: string | null
          logo_thumbnail_url: string | null
          logo_url: string | null
          ownership_type: string | null
          ownership_type_id: string | null
          position: string
          start_date: string | null
          state_id: string | null
          tags: string[] | null
          updated_at: string
          user_id: string
          website: string | null
          year_established: number | null
        }
        Insert: {
          banner_thumbnail_url?: string | null
          banner_url?: string | null
          business_name: string
          business_registration_number?: string | null
          business_size?: string | null
          business_size_id?: string | null
          city_id?: string | null
          country_id?: string | null
          created_at?: string
          current_business?: boolean | null
          description?: string | null
          employee_count_range?: string | null
          employee_range_id?: string | null
          end_date?: string | null
          featured_image_url?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          location_city?: string | null
          location_country?: string | null
          location_state?: string | null
          logo_thumbnail_url?: string | null
          logo_url?: string | null
          ownership_type?: string | null
          ownership_type_id?: string | null
          position: string
          start_date?: string | null
          state_id?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
          website?: string | null
          year_established?: number | null
        }
        Update: {
          banner_thumbnail_url?: string | null
          banner_url?: string | null
          business_name?: string
          business_registration_number?: string | null
          business_size?: string | null
          business_size_id?: string | null
          city_id?: string | null
          country_id?: string | null
          created_at?: string
          current_business?: boolean | null
          description?: string | null
          employee_count_range?: string | null
          employee_range_id?: string | null
          end_date?: string | null
          featured_image_url?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          location_city?: string | null
          location_country?: string | null
          location_state?: string | null
          logo_thumbnail_url?: string | null
          logo_url?: string | null
          ownership_type?: string | null
          ownership_type_id?: string | null
          position?: string
          start_date?: string | null
          state_id?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
          website?: string | null
          year_established?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_businesses_business_size_id_fkey"
            columns: ["business_size_id"]
            isOneToOne: false
            referencedRelation: "business_sizes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_businesses_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_businesses_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_businesses_employee_range_id_fkey"
            columns: ["employee_range_id"]
            isOneToOne: false
            referencedRelation: "employee_ranges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_businesses_ownership_type_id_fkey"
            columns: ["ownership_type_id"]
            isOneToOne: false
            referencedRelation: "ownership_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_businesses_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_businesses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_education: {
        Row: {
          created_at: string
          graduation_year: number
          id: string
          is_primary: boolean | null
          programme_id: string | null
          programme_level: string
          programme_level_id: string | null
          programme_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          graduation_year: number
          id?: string
          is_primary?: boolean | null
          programme_id?: string | null
          programme_level: string
          programme_level_id?: string | null
          programme_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          graduation_year?: number
          id?: string
          is_primary?: boolean | null
          programme_id?: string | null
          programme_level?: string
          programme_level_id?: string | null
          programme_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_education_programme_id_fkey"
            columns: ["programme_id"]
            isOneToOne: false
            referencedRelation: "programmes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_education_programme_level_id_fkey"
            columns: ["programme_level_id"]
            isOneToOne: false
            referencedRelation: "education_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_education_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_links: {
        Row: {
          created_at: string
          display_text: string | null
          id: string
          platform: string
          platform_id: string | null
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_text?: string | null
          id?: string
          platform: string
          platform_id?: string | null
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_text?: string | null
          id?: string
          platform?: string
          platform_id?: string | null
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_links_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "social_platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_links_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_view_business_data: {
        Args: { _business_user_id: string; _requester_id: string }
        Returns: boolean
      }
      can_view_financial_data: {
        Args: { _is_private: boolean; _requester_id: string; _user_id: string }
        Returns: boolean
      }
      check_required_profile_data: {
        Args: { user_id_param: string }
        Returns: boolean
      }
      create_conversation_atomic: {
        Args: { p_is_group?: boolean; p_participant_id: string }
        Returns: string
      }
      get_contribution_analytics: {
        Args: Record<PropertyKey, never>
        Returns: {
          course: string
          full_name: string
          graduation_year: number
          monetary_contributions: number
          non_monetary_contributions: number
          total_contribution_value_all: number
          total_contribution_value_public: number
          total_contributions: number
          total_monetary_all: number
          total_monetary_public: number
          total_non_monetary_all: number
          total_non_monetary_public: number
          user_id: string
        }[]
      }
      get_development_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          is_enabled: boolean
          real_profiles_count: number
          seed_profiles_count: number
        }[]
      }
      get_public_profiles: {
        Args: Record<PropertyKey, never>
        Returns: {
          avatar_thumbnail_url: string
          avatar_url: string
          bio: string
          course: string
          created_at: string
          email: string
          full_name: string
          graduation_year: number
          is_own_profile: boolean
          is_verified: boolean
          location_city: string
          location_country: string
          location_state: string
          profile_visibility: Database["public"]["Enums"]["profile_visibility"]
          tags: string[]
          updated_at: string
          user_id: string
        }[]
      }
      get_user_onboarding_status: {
        Args: { p_user_id: string }
        Returns: {
          completed_steps: number
          completion_percentage: number
          current_step: number
          last_activity: string
          required_completed: boolean
          total_steps: number
          total_time_spent: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_development_mode: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_participant: {
        Args: { p_conversation_id: string; p_user_id: string }
        Returns: boolean
      }
      search_public_profiles: {
        Args: { limit_count?: number; search_term?: string }
        Returns: {
          avatar_thumbnail_url: string
          avatar_url: string
          bio: string
          course: string
          full_name: string
          graduation_year: number
          is_verified: boolean
          location_city: string
          location_country: string
          location_state: string
          tags: string[]
          user_id: string
        }[]
      }
      toggle_development_mode: {
        Args: { enabled: boolean }
        Returns: undefined
      }
    }
    Enums: {
      profile_visibility: "public" | "alumni_only" | "private"
      user_role: "admin" | "alumni" | "pending"
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
      profile_visibility: ["public", "alumni_only", "private"],
      user_role: ["admin", "alumni", "pending"],
    },
  },
} as const
