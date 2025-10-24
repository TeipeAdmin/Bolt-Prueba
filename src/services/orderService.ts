import { supabase } from '../lib/supabase';
import { Order } from '../types';

export const orderService = {
  async createOrder(orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; order?: Order; error?: string }> {
    try {
      const now = new Date().toISOString();

      const orderToInsert = {
        restaurant_id: orderData.restaurant_id,
        order_number: orderData.order_number,
        customer: orderData.customer,
        items: orderData.items,
        order_type: orderData.order_type,
        delivery_address: orderData.delivery_address || null,
        table_number: orderData.table_number || null,
        delivery_cost: orderData.delivery_cost || 0,
        subtotal: orderData.subtotal,
        total: orderData.total,
        status: orderData.status || 'pending',
        estimated_time: orderData.estimated_time || null,
        special_instructions: orderData.special_instructions || null,
        created_at: now,
        updated_at: now,
      };

      const { data, error } = await supabase
        .from('orders')
        .insert([orderToInsert])
        .select()
        .single();

      if (error) {
        console.error('Error creating order in Supabase:', error);
        return { success: false, error: error.message };
      }

      return { success: true, order: data as Order };
    } catch (error) {
      console.error('Error in createOrder:', error);
      return { success: false, error: 'Error al crear el pedido' };
    }
  },

  async getRestaurantOrders(restaurantId: string): Promise<{ success: boolean; orders?: Order[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        return { success: false, error: error.message };
      }

      return { success: true, orders: data as Order[] };
    } catch (error) {
      console.error('Error in getRestaurantOrders:', error);
      return { success: false, error: 'Error al obtener los pedidos' };
    }
  },

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in updateOrderStatus:', error);
      return { success: false, error: 'Error al actualizar el estado del pedido' };
    }
  },

  async deleteOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) {
        console.error('Error deleting order:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in deleteOrder:', error);
      return { success: false, error: 'Error al eliminar el pedido' };
    }
  },

  async updateOrder(orderId: string, updates: Partial<Omit<Order, 'id' | 'created_at' | 'updated_at'>>): Promise<{ success: boolean; error?: string }> {
    try {
      const updateData: any = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in updateOrder:', error);
      return { success: false, error: 'Error al actualizar el pedido' };
    }
  },

  generateOrderNumber(restaurantId: string): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `#${timestamp}-${random}`;
  }
};
