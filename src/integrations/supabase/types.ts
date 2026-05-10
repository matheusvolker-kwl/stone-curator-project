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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      guide_exports: {
        Row: {
          created_at: string
          id: string
          payload: Json
          pdf_url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          payload?: Json
          pdf_url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          payload?: Json
          pdf_url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          cep: string | null
          cidade: string | null
          cnpj: string | null
          created_at: string
          email: string | null
          empresa: string | null
          endereco: string | null
          id: string
          mensagem: string | null
          nome: string | null
          origem: string | null
          payload: Json
          segmento: string | null
          telefone: string | null
          type: Database["public"]["Enums"]["lead_type"]
          uf: string | null
          user_id: string | null
        }
        Insert: {
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          created_at?: string
          email?: string | null
          empresa?: string | null
          endereco?: string | null
          id?: string
          mensagem?: string | null
          nome?: string | null
          origem?: string | null
          payload?: Json
          segmento?: string | null
          telefone?: string | null
          type: Database["public"]["Enums"]["lead_type"]
          uf?: string | null
          user_id?: string | null
        }
        Update: {
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          created_at?: string
          email?: string | null
          empresa?: string | null
          endereco?: string | null
          id?: string
          mensagem?: string | null
          nome?: string | null
          origem?: string | null
          payload?: Json
          segmento?: string | null
          telefone?: string | null
          type?: Database["public"]["Enums"]["lead_type"]
          uf?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      partner_profiles: {
        Row: {
          approved_at: string | null
          bairro: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cargo: string | null
          cep: string | null
          cidade: string | null
          cnpj: string | null
          complemento: string | null
          created_at: string
          discount_override: number | null
          empresa: string | null
          endereco: string | null
          estado: string | null
          id: string
          instagram: string | null
          newsletter_opt_in: boolean
          nome: string | null
          numero: string | null
          payment_methods: Json
          segmento: string | null
          site: string | null
          status: Database["public"]["Enums"]["partner_status"]
          telefone: string | null
          tier: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          bairro?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cargo?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          complemento?: string | null
          created_at?: string
          discount_override?: number | null
          empresa?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          instagram?: string | null
          newsletter_opt_in?: boolean
          nome?: string | null
          numero?: string | null
          payment_methods?: Json
          segmento?: string | null
          site?: string | null
          status?: Database["public"]["Enums"]["partner_status"]
          telefone?: string | null
          tier?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          bairro?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cargo?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          complemento?: string | null
          created_at?: string
          discount_override?: number | null
          empresa?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          instagram?: string | null
          newsletter_opt_in?: boolean
          nome?: string | null
          numero?: string | null
          payment_methods?: Json
          segmento?: string | null
          site?: string | null
          status?: Database["public"]["Enums"]["partner_status"]
          telefone?: string | null
          tier?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          cidade: string | null
          created_at: string
          id: string
          nome: string
          notas: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cidade?: string | null
          created_at?: string
          id?: string
          nome: string
          notas?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cidade?: string | null
          created_at?: string
          id?: string
          nome?: string
          notas?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_carts: {
        Row: {
          cart_id: string | null
          checkout_url: string | null
          items: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          cart_id?: string | null
          checkout_url?: string | null
          items?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          cart_id?: string | null
          checkout_url?: string | null
          items?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      system_flags: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      tier_defaults: {
        Row: {
          boleto: boolean
          discount_pct: number
          kit_gratis: boolean
          parcelas_max: number
          tier: string
          updated_at: string
        }
        Insert: {
          boleto?: boolean
          discount_pct?: number
          kit_gratis?: boolean
          parcelas_max?: number
          tier: string
          updated_at?: string
        }
        Update: {
          boleto?: boolean
          discount_pct?: number
          kit_gratis?: boolean
          parcelas_max?: number
          tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          product_handle: string
          product_image: string | null
          product_title: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_handle: string
          product_image?: string | null
          product_title?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_handle?: string
          product_image?: string | null
          product_title?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_first_admin: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "partner"
      lead_type:
        | "partner_signup"
        | "newsletter"
        | "amostras"
        | "visita"
        | "contato"
        | "orcamento"
      partner_status: "pending" | "approved" | "rejected" | "cancelled"
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
      app_role: ["admin", "partner"],
      lead_type: [
        "partner_signup",
        "newsletter",
        "amostras",
        "visita",
        "contato",
        "orcamento",
      ],
      partner_status: ["pending", "approved", "rejected", "cancelled"],
    },
  },
} as const
