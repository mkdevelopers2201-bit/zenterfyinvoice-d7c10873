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
      bills: {
        Row: {
          bill_number: string
          cgst_total: number
          challan_ids: string[]
          created_at: string
          customer_address: string | null
          customer_gstin: string | null
          customer_id: string | null
          customer_name: string
          date: string
          gst_amount: number
          id: string
          items: Json
          net_amount: number
          round_off: number
          sgst_total: number
          status: string
          subtotal: number
          updated_at: string
          user_id: string
        }
        Insert: {
          bill_number: string
          cgst_total?: number
          challan_ids?: string[]
          created_at?: string
          customer_address?: string | null
          customer_gstin?: string | null
          customer_id?: string | null
          customer_name: string
          date?: string
          gst_amount?: number
          id?: string
          items?: Json
          net_amount?: number
          round_off?: number
          sgst_total?: number
          status?: string
          subtotal?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          bill_number?: string
          cgst_total?: number
          challan_ids?: string[]
          created_at?: string
          customer_address?: string | null
          customer_gstin?: string | null
          customer_id?: string | null
          customer_name?: string
          date?: string
          gst_amount?: number
          id?: string
          items?: Json
          net_amount?: number
          round_off?: number
          sgst_total?: number
          status?: string
          subtotal?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bills_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          createdAt: string | null
          gstin: string | null
          id: string
          name: string
          phone: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          createdAt?: string | null
          gstin?: string | null
          id?: string
          name: string
          phone?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          createdAt?: string | null
          gstin?: string | null
          id?: string
          name?: string
          phone?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      delivery_challans: {
        Row: {
          bill_id: string | null
          challan_number: string
          created_at: string
          current_amount: number
          customer_address: string | null
          customer_id: string | null
          customer_name: string
          customer_phone: string | null
          date: string
          grand_total: number
          id: string
          is_billed: boolean
          items: Json
          previous_balance: number
          updated_at: string
          user_id: string
        }
        Insert: {
          bill_id?: string | null
          challan_number: string
          created_at?: string
          current_amount?: number
          customer_address?: string | null
          customer_id?: string | null
          customer_name: string
          customer_phone?: string | null
          date?: string
          grand_total?: number
          id?: string
          is_billed?: boolean
          items?: Json
          previous_balance?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          bill_id?: string | null
          challan_number?: string
          created_at?: string
          current_amount?: number
          customer_address?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string | null
          date?: string
          grand_total?: number
          id?: string
          is_billed?: boolean
          items?: Json
          previous_balance?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_challans_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_challans_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          address: string | null
          cgstTotal: number | null
          createdAt: string | null
          customerId: string | null
          customerName: string | null
          date: string | null
          grandTotal: number | null
          gstAmount: number | null
          gstin: string | null
          id: string
          invoiceNumber: string
          items: Json | null
          po: string | null
          roundOff: number | null
          sgstTotal: number | null
          status: string | null
          user_id: string | null
          withoutGst: number | null
        }
        Insert: {
          address?: string | null
          cgstTotal?: number | null
          createdAt?: string | null
          customerId?: string | null
          customerName?: string | null
          date?: string | null
          grandTotal?: number | null
          gstAmount?: number | null
          gstin?: string | null
          id?: string
          invoiceNumber: string
          items?: Json | null
          po?: string | null
          roundOff?: number | null
          sgstTotal?: number | null
          status?: string | null
          user_id?: string | null
          withoutGst?: number | null
        }
        Update: {
          address?: string | null
          cgstTotal?: number | null
          createdAt?: string | null
          customerId?: string | null
          customerName?: string | null
          date?: string | null
          grandTotal?: number | null
          gstAmount?: number | null
          gstin?: string | null
          id?: string
          invoiceNumber?: string
          items?: Json | null
          po?: string | null
          roundOff?: number | null
          sgstTotal?: number | null
          status?: string | null
          user_id?: string | null
          withoutGst?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customerId_fkey"
            columns: ["customerId"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          createdAt: string | null
          hsncode: string | null
          id: string
          name: string
          rate: number | null
          user_id: string | null
        }
        Insert: {
          createdAt?: string | null
          hsncode?: string | null
          id?: string
          name: string
          rate?: number | null
          user_id?: string | null
        }
        Update: {
          createdAt?: string | null
          hsncode?: string | null
          id?: string
          name?: string
          rate?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      tranzecfy_accounts: {
        Row: {
          created_at: string
          gstin: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          gstin?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          gstin?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      tranzecfy_transactions: {
        Row: {
          amount: number
          created_at: string
          date: string
          description: string | null
          from_account: string | null
          id: string
          running_balance: number
          to_account: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          date?: string
          description?: string | null
          from_account?: string | null
          id?: string
          running_balance?: number
          to_account?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          description?: string | null
          from_account?: string | null
          id?: string
          running_balance?: number
          to_account?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
