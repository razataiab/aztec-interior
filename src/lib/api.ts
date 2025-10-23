// Create a utility file: src/lib/api.ts

/**
 * Helper function to make authenticated API calls
 * Uses the token stored in localStorage by AuthContext
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
    // Get token from localStorage (where AuthContext stores it as 'auth_token')
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      console.error('No auth token found');
      window.location.href = '/login';
      throw new Error('Not authenticated');
    }
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };
  
    const response = await fetch(url, {
      ...options,
      headers,
    });
  
    // Handle 401 errors
    if (response.status === 401) {
      console.error('Authentication failed - redirecting to login');
      // Token expired or invalid - clear auth and redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
      throw new Error('Authentication failed');
    }
  
    return response;
  }
  
  // Example usage functions
  export const api = {
    async getCustomers() {
      const response = await fetchWithAuth('http://127.0.0.1:5000/customers');
      if (!response.ok) throw new Error('Failed to fetch customers');
      return response.json();
    },
  
    async getJobs() {
      const response = await fetchWithAuth('http://127.0.0.1:5000/jobs');
      if (!response.ok) throw new Error('Failed to fetch jobs');
      return response.json();
    },
  
    async getPipeline() {
      const response = await fetchWithAuth('http://127.0.0.1:5000/pipeline');
      if (!response.ok) throw new Error('Failed to fetch pipeline');
      return response.json();
    },
  
    async updateCustomerStage(customerId: string, stage: string, reason: string, updatedBy: string) {
      const response = await fetchWithAuth(`http://127.0.0.1:5000/customers/${customerId}/stage`, {
        method: 'PATCH',
        body: JSON.stringify({ stage, reason, updated_by: updatedBy }),
      });
      if (!response.ok) throw new Error('Failed to update customer stage');
      return response.json();
    },
  
    async updateJobStage(jobId: string, stage: string, reason: string, updatedBy: string) {
      const response = await fetchWithAuth(`http://127.0.0.1:5000/jobs/${jobId}/stage`, {
        method: 'PATCH',
        body: JSON.stringify({ stage, reason, updated_by: updatedBy }),
      });
      if (!response.ok) throw new Error('Failed to update job stage');
      return response.json();
    },
  };