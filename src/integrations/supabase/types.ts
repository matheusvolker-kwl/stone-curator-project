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
      checkout_tickets: {
        Row: {
          consumed_at: string | null
          consumer_ip: string | null
          created_at: string
          expires_at: string
          payload: Json
          ticket: string
          user_id: string
        }
        Insert: {
          consumed_at?: string | null
          consumer_ip?: string | null
          created_at?: string
          expires_at: string
          payload: Json
          ticket: string
          user_id: string
        }
        Update: {
          consumed_at?: string | null
          consumer_ip?: string | null
          created_at?: string
          expires_at?: string
          payload?: Json
          ticket?: string
          user_id?: string
        }
        Relationships: []
      }
      client_errors: {
        Row: {
          context: Json
          created_at: string
          id: string
          message: string
          severity: string
          source: string
          stack: string | null
          url: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          context?: Json
          created_at?: string
          id?: string
          message: string
          severity?: string
          source: string
          stack?: string | null
          url?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          context?: Json
          created_at?: string
          id?: string
          message?: string
          severity?: string
          source?: string
          stack?: string | null
          url?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      cnae_whitelist: {
        Row: {
          codigo: string
          created_at: string
          descricao: string | null
          tier: string
          updated_at: string
        }
        Insert: {
          codigo: string
          created_at?: string
          descricao?: string | null
          tier: string
          updated_at?: string
        }
        Update: {
          codigo?: string
          created_at?: string
          descricao?: string | null
          tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      credenciamentos: {
        Row: {
          card_path: string | null
          cnae_match: string | null
          cnae_match_tier: string | null
          cnae_principal: string | null
          cnaes_secundarios: string[] | null
          cnpj: string
          created_at: string
          decisao: string
          email: string | null
          empresa: string | null
          fonte: string | null
          id: string
          motivo: string | null
          nome: string | null
          protocolo: string | null
          raw_response: Json | null
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          situacao: string | null
          status_manual: string
          tier: string | null
          user_id: string | null
        }
        Insert: {
          card_path?: string | null
          cnae_match?: string | null
          cnae_match_tier?: string | null
          cnae_principal?: string | null
          cnaes_secundarios?: string[] | null
          cnpj: string
          created_at?: string
          decisao: string
          email?: string | null
          empresa?: string | null
          fonte?: string | null
          id?: string
          motivo?: string | null
          nome?: string | null
          protocolo?: string | null
          raw_response?: Json | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          situacao?: string | null
          status_manual?: string
          tier?: string | null
          user_id?: string | null
        }
        Update: {
          card_path?: string | null
          cnae_match?: string | null
          cnae_match_tier?: string | null
          cnae_principal?: string | null
          cnaes_secundarios?: string[] | null
          cnpj?: string
          created_at?: string
          decisao?: string
          email?: string | null
          empresa?: string | null
          fonte?: string | null
          id?: string
          motivo?: string | null
          nome?: string | null
          protocolo?: string | null
          raw_response?: Json | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          situacao?: string | null
          status_manual?: string
          tier?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      credenciar_daily_counters: {
        Row: {
          count: number
          counter_key: string
          day: string
        }
        Insert: {
          count?: number
          counter_key: string
          day: string
        }
        Update: {
          count?: number
          counter_key?: string
          day?: string
        }
        Relationships: []
      }
      credenciar_rate_buckets: {
        Row: {
          bucket_key: string
          created_at: string
          id: string
        }
        Insert: {
          bucket_key: string
          created_at?: string
          id?: string
        }
        Update: {
          bucket_key?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
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
          items_hash: string | null
          last_activity_at: string
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
          items_hash?: string | null
          last_activity_at?: string
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
          items_hash?: string | null
          last_activity_at?: string
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
          credenciado_em: string | null
          credenciado_fonte: string | null
          credenciamento_id: string | null
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
          pending_reason: string | null
          segmento: string | null
          senha_provisoria_em: string | null
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
          credenciado_em?: string | null
          credenciado_fonte?: string | null
          credenciamento_id?: string | null
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
          pending_reason?: string | null
          segmento?: string | null
          senha_provisoria_em?: string | null
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
          credenciado_em?: string | null
          credenciado_fonte?: string | null
          credenciamento_id?: string | null
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
          pending_reason?: string | null
          segmento?: string | null
          senha_provisoria_em?: string | null
          site?: string | null
          status?: Database["public"]["Enums"]["partner_status"]
          telefone?: string | null
          tier?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_profiles_credenciamento_id_fkey"
            columns: ["credenciamento_id"]
            isOneToOne: false
            referencedRelation: "credenciamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      pedido_pdf_downloads: {
        Row: {
          created_at: string
          filename: string
          id: string
          order_id: string
          scenario: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filename: string
          id?: string
          order_id: string
          scenario: string
          user_id: string
        }
        Update: {
          created_at?: string
          filename?: string
          id?: string
          order_id?: string
          scenario?: string
          user_id?: string
        }
        Relationships: []
      }
      production_order_events: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          note: string | null
          order_id: string
          status: Database["public"]["Enums"]["production_status"] | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          order_id: string
          status?: Database["public"]["Enums"]["production_status"] | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          order_id?: string
          status?: Database["public"]["Enums"]["production_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "production_order_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "production_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      production_orders: {
        Row: {
          cliente_email: string | null
          cliente_nome: string | null
          cliente_telefone: string | null
          conjuntos: string | null
          created_at: string
          date_paid: string | null
          endereco_entrega: string | null
          id: string
          itens: Json | null
          lead_id: string | null
          modo_entrega: Database["public"]["Enums"]["fulfillment_mode"]
          needs_linking: boolean | null
          numero: string
          observacoes_admin: string | null
          observacoes_cliente: string | null
          origem: string | null
          payment_method: string | null
          payment_method_title: string | null
          payment_status: string | null
          prazo_dias_uteis: number
          previsao_entrega: string | null
          produzir_ate: string | null
          shipping_method_id: string | null
          shipping_total: number | null
          status: Database["public"]["Enums"]["production_status"]
          titulo: string
          tracking_code: string | null
          transportadora: string | null
          updated_at: string
          user_id: string | null
          valor_total: number | null
          woo_order_id: number | null
          woo_status: string | null
        }
        Insert: {
          cliente_email?: string | null
          cliente_nome?: string | null
          cliente_telefone?: string | null
          conjuntos?: string | null
          created_at?: string
          date_paid?: string | null
          endereco_entrega?: string | null
          id?: string
          itens?: Json | null
          lead_id?: string | null
          modo_entrega?: Database["public"]["Enums"]["fulfillment_mode"]
          needs_linking?: boolean | null
          numero: string
          observacoes_admin?: string | null
          observacoes_cliente?: string | null
          origem?: string | null
          payment_method?: string | null
          payment_method_title?: string | null
          payment_status?: string | null
          prazo_dias_uteis?: number
          previsao_entrega?: string | null
          produzir_ate?: string | null
          shipping_method_id?: string | null
          shipping_total?: number | null
          status?: Database["public"]["Enums"]["production_status"]
          titulo: string
          tracking_code?: string | null
          transportadora?: string | null
          updated_at?: string
          user_id?: string | null
          valor_total?: number | null
          woo_order_id?: number | null
          woo_status?: string | null
        }
        Update: {
          cliente_email?: string | null
          cliente_nome?: string | null
          cliente_telefone?: string | null
          conjuntos?: string | null
          created_at?: string
          date_paid?: string | null
          endereco_entrega?: string | null
          id?: string
          itens?: Json | null
          lead_id?: string | null
          modo_entrega?: Database["public"]["Enums"]["fulfillment_mode"]
          needs_linking?: boolean | null
          numero?: string
          observacoes_admin?: string | null
          observacoes_cliente?: string | null
          origem?: string | null
          payment_method?: string | null
          payment_method_title?: string | null
          payment_status?: string | null
          prazo_dias_uteis?: number
          previsao_entrega?: string | null
          produzir_ate?: string | null
          shipping_method_id?: string | null
          shipping_total?: number | null
          status?: Database["public"]["Enums"]["production_status"]
          titulo?: string
          tracking_code?: string | null
          transportadora?: string | null
          updated_at?: string
          user_id?: string | null
          valor_total?: number | null
          woo_order_id?: number | null
          woo_status?: string | null
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
      quote_pdfs: {
        Row: {
          created_at: string
          id: string
          items_count: number
          lead_id: string | null
          storage_path: string
          subtotal: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          items_count?: number
          lead_id?: string | null
          storage_path: string
          subtotal?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          items_count?: number
          lead_id?: string | null
          storage_path?: string
          subtotal?: number
          user_id?: string
        }
        Relationships: []
      }
      quote_proposals: {
        Row: {
          created_at: string
          created_by: string | null
          discount_pct: number
          discount_value: number
          forma_pagamento: string | null
          id: string
          items: Json
          lead_id: string
          numero: string
          observacoes: string | null
          parcelas: number | null
          pdf_path: string | null
          sent_at: string | null
          subtotal: number
          total: number
          validade_dias: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          discount_pct?: number
          discount_value?: number
          forma_pagamento?: string | null
          id?: string
          items?: Json
          lead_id: string
          numero: string
          observacoes?: string | null
          parcelas?: number | null
          pdf_path?: string | null
          sent_at?: string | null
          subtotal?: number
          total?: number
          validade_dias?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          discount_pct?: number
          discount_value?: number
          forma_pagamento?: string | null
          id?: string
          items?: Json
          lead_id?: string
          numero?: string
          observacoes?: string | null
          parcelas?: number | null
          pdf_path?: string | null
          sent_at?: string | null
          subtotal?: number
          total?: number
          validade_dias?: number | null
        }
        Relationships: []
      }
      quote_threads: {
        Row: {
          archived_at: string | null
          created_at: string
          forma_pagamento: string | null
          id: string
          lead_id: string
          notas: string | null
          observacoes_venda: string | null
          pago_em: string | null
          parcelas: number | null
          status: Database["public"]["Enums"]["quote_status"]
          updated_at: string
          valor_final: number | null
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          forma_pagamento?: string | null
          id?: string
          lead_id: string
          notas?: string | null
          observacoes_venda?: string | null
          pago_em?: string | null
          parcelas?: number | null
          status?: Database["public"]["Enums"]["quote_status"]
          updated_at?: string
          valor_final?: number | null
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          forma_pagamento?: string | null
          id?: string
          lead_id?: string
          notas?: string | null
          observacoes_venda?: string | null
          pago_em?: string | null
          parcelas?: number | null
          status?: Database["public"]["Enums"]["quote_status"]
          updated_at?: string
          valor_final?: number | null
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
      senha_provisoria_log: {
        Row: {
          criada_em: string
          gerada_por: string
          id: string
          usada_em: string | null
          user_id: string
        }
        Insert: {
          criada_em?: string
          gerada_por: string
          id?: string
          usada_em?: string | null
          user_id: string
        }
        Update: {
          criada_em?: string
          gerada_por?: string
          id?: string
          usada_em?: string | null
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
      woo_proxy_cache: {
        Row: {
          body: string
          cache_key: string
          content_type: string
          fetched_at: string
          status: number
        }
        Insert: {
          body: string
          cache_key: string
          content_type?: string
          fetched_at?: string
          status: number
        }
        Update: {
          body?: string
          cache_key?: string
          content_type?: string
          fetched_at?: string
          status?: number
        }
        Relationships: []
      }
    }
    Views: {
      lead_conversion_funnel: {
        Row: {
          horas_medias_ate_promocao: number | null
          orcamentos: number | null
          pdf_redownloads: number | null
          pedidos: number | null
          promovidos: number | null
          semana: string | null
          taxa_conversao_pct: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      claim_first_admin: { Args: never; Returns: boolean }
      cleanup_expired_checkout_tickets: { Args: never; Returns: number }
      cleanup_old_cartoes_cnpj: { Args: never; Returns: number }
      consume_checkout_ticket: {
        Args: { _ip: string; _ticket: string }
        Returns: Json
      }
      find_user_id_by_email: { Args: { _email: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      promote_quote_lead_to_order: {
        Args: { _lead_id: string; _order_id?: string }
        Returns: undefined
      }
      register_orcamento_lead: {
        Args: {
          _cidade: string
          _email: string
          _empresa: string
          _items_hash: string
          _mensagem: string
          _nome: string
          _origem: string
          _payload: Json
          _telefone: string
        }
        Returns: {
          lead_id: string
          was_updated: boolean
        }[]
      }
      register_pedido_novo_lead: {
        Args: {
          _cidade: string
          _email: string
          _empresa: string
          _items_hash: string
          _mensagem: string
          _nome: string
          _origem: string
          _payload: Json
          _telefone: string
        }
        Returns: {
          lead_id: string
          was_updated: boolean
        }[]
      }
      register_pedido_pdf_download: {
        Args: { _filename: string; _order_id: string }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "partner"
      fulfillment_mode: "retirada" | "frete"
      lead_type:
        | "partner_signup"
        | "newsletter"
        | "amostras"
        | "visita"
        | "contato"
        | "orcamento"
        | "pdf_pedido"
        | "pedido_novo"
        | "b2c_orcamento"
      partner_status: "pending" | "approved" | "rejected" | "cancelled"
      production_status:
        | "aguardando"
        | "em_producao"
        | "controle_qualidade"
        | "pronto"
        | "em_transporte"
        | "entregue"
        | "retirado"
        | "cancelado"
      quote_status:
        | "novo"
        | "em_atendimento"
        | "proposta_enviada"
        | "fechado"
        | "perdido"
        | "arquivado"
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
      fulfillment_mode: ["retirada", "frete"],
      lead_type: [
        "partner_signup",
        "newsletter",
        "amostras",
        "visita",
        "contato",
        "orcamento",
        "pdf_pedido",
        "pedido_novo",
        "b2c_orcamento",
      ],
      partner_status: ["pending", "approved", "rejected", "cancelled"],
      production_status: [
        "aguardando",
        "em_producao",
        "controle_qualidade",
        "pronto",
        "em_transporte",
        "entregue",
        "retirado",
        "cancelado",
      ],
      quote_status: [
        "novo",
        "em_atendimento",
        "proposta_enviada",
        "fechado",
        "perdido",
        "arquivado",
      ],
    },
  },
} as const
