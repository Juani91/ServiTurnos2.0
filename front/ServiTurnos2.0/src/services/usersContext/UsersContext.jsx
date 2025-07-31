import { createContext, useContext } from 'react';

const UsersContext = createContext();

export const UsersProvider = ({ children }) => {

  const RegisterCustomer = async (data) => {

    const payload = {
      ...data,
      phoneNumber: null,
      city: null,
      imageURL: null,
    };

    try {
      const response = await fetch('https://localhost:7286/api/Customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const text = await response.text();

      if (!response.ok) {
        return { success: false, msg: text };
      }

      return { success: true, msg: text };

    } catch (error) {
      return { success: false, msg: 'Error de conexión con el servidor.' };
    }
  };

  const RegisterProfessional = async (data) => {

    const payload = {
      ...data,
      phoneNumber: null,
      city: null,
      imageURL: null,
      profession: null,
      fee: null,
      availability: null,
    };

    try {
      const response = await fetch('https://localhost:7286/api/Professional', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const text = await response.text();

      if (!response.ok) {
        return { success: false, msg: text };
      }

      return { success: true, msg: text };

    } catch (error) {
      return { success: false, msg: 'Error de conexión con el servidor.' };
    }
  };

  const GetAdminById = async (id, token) => {
    try {
      const response = await fetch(`https://localhost:7286/api/Admin/${id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const msg = await response.text();
        return { success: false, msg };
      }

      const data = await response.json();
      return { success: true, data };

    } catch (error) {
      return { success: false, msg: 'Error de conexión con el servidor.' };
    }
  };

  const GetCustomerById = async (id, token) => {
    try {
      const response = await fetch(`https://localhost:7286/api/Customer/${id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const msg = await response.text();
        return { success: false, msg };
      }

      const data = await response.json();
      return { success: true, data };

    } catch (error) {
      return { success: false, msg: 'Error de conexión con el servidor.' };
    }
  };

  const GetProfessionalById = async (id, token) => {
    try {
      const response = await fetch(`https://localhost:7286/api/Professional/${id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const msg = await response.text();
        return { success: false, msg };
      }

      const data = await response.json();
      return { success: true, data };

    } catch (error) {
      return { success: false, msg: 'Error de conexión con el servidor.' };
    }
  };

  const UpdateAdmin = async (id, data, token) => {
    const { password, ...rest } = data;
    const payload = password ? { ...rest, password } : rest;
  
    try {
      const response = await fetch(`https://localhost:7286/api/Admin/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload) // ✅ CORRECTO
      });
  
      const text = await response.text();
  
      if (!response.ok) {
        return { success: false, msg: text };
      }
  
      return { success: true, msg: text };
    } catch (error) {
      return { success: false, msg: 'Error al conectar con el servidor.' };
    }
  };
  

  const UpdateCustomer = async (id, data, token) => {
    const { password, ...rest } = data;
    const payload = password ? { ...rest, password } : rest;
  
    try {
      const response = await fetch(`https://localhost:7286/api/Customer/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
  
      const text = await response.text();
  
      if (!response.ok) {
        return { success: false, msg: text };
      }
  
      return { success: true, msg: text };
    } catch (error) {
      return { success: false, msg: 'Error al conectar con el servidor.' };
    }
  };
  
  const UpdateProfessional = async (id, data, token) => {
    const { password, ...rest } = data;
    const payload = password ? { ...rest, password } : rest;
  
    try {
      const response = await fetch(`https://localhost:7286/api/Professional/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
  
      const text = await response.text();
  
      if (!response.ok) {
        return { success: false, msg: text };
      }
  
      return { success: true, msg: text };
    } catch (error) {
      return { success: false, msg: 'Error al conectar con el servidor.' };
    }
  };

  const GetAllProfessionals = async (token) => {
    try {
      const response = await fetch('https://localhost:7286/api/Professional', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': '*/*'
        }
      });

      if (!response.ok) {
        const msg = await response.text();
        return { success: false, msg };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, msg: 'Error de conexión con el servidor.' };
    }
  };

  const GetAllCustomers = async (token) => {
    try {
      const response = await fetch('https://localhost:7286/api/Customer', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': '*/*'
        }
      });

      if (!response.ok) {
        const msg = await response.text();
        return { success: false, msg };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, msg: 'Error de conexión con el servidor.' };
    }
  };

  const SoftDeleteCustomer = async (id, token) => {
    try {
      const response = await fetch(`https://localhost:7286/api/Customer/soft/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': '*/*'
        }
      });

      if (!response.ok) {
        const msg = await response.text();
        return { success: false, msg };
      }

      const text = await response.text();
      return { success: true, msg: text };
    } catch (error) {
      return { success: false, msg: 'Error de conexión con el servidor.' };
    }
  };

  const SoftDeleteProfessional = async (id, token) => {
    try {
      const response = await fetch(`https://localhost:7286/api/Professional/soft/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': '*/*'
        }
      });

      if (!response.ok) {
        const msg = await response.text();
        return { success: false, msg };
      }

      const text = await response.text();
      return { success: true, msg: text };
    } catch (error) {
      return { success: false, msg: 'Error de conexión con el servidor.' };
    }
  };

  const HardDeleteCustomer = async (id, token) => {
    try {
      const response = await fetch(`https://localhost:7286/api/Customer/hard/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': '*/*'
        }
      });

      if (!response.ok) {
        const msg = await response.text();
        return { success: false, msg };
      }

      const text = await response.text();
      return { success: true, msg: text };
    } catch (error) {
      return { success: false, msg: 'Error de conexión con el servidor.' };
    }
  };

  const HardDeleteProfessional = async (id, token) => {
    try {
      const response = await fetch(`https://localhost:7286/api/Professional/hard/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': '*/*'
        }
      });

      if (!response.ok) {
        const msg = await response.text();
        return { success: false, msg };
      }

      const text = await response.text();
      return { success: true, msg: text };
    } catch (error) {
      return { success: false, msg: 'Error de conexión con el servidor.' };
    }
  };

  const HardDeleteAdmin = async (id, token) => {
    try {
      const response = await fetch(`https://localhost:7286/api/Admin/hard/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': '*/*'
        }
      });

      if (!response.ok) {
        const msg = await response.text();
        return { success: false, msg };
      }

      const text = await response.text();
      return { success: true, msg: text };
    } catch (error) {
      return { success: false, msg: 'Error de conexión con el servidor.' };
    }
  };

  const data = {
    RegisterCustomer,
    RegisterProfessional,
    GetAdminById,
    GetCustomerById,
    GetProfessionalById,
    UpdateAdmin,
    UpdateCustomer,
    UpdateProfessional,
    GetAllProfessionals,
    GetAllCustomers,
    SoftDeleteCustomer,
    SoftDeleteProfessional,
    HardDeleteCustomer,
    HardDeleteProfessional,
    HardDeleteAdmin
  };


  return <UsersContext.Provider value={data}>{children}</UsersContext.Provider>;
};

export const useUsers = () => useContext(UsersContext);
