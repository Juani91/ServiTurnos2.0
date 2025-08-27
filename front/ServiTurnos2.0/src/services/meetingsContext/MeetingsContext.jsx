import { createContext, useContext } from 'react';

const MeetingsContext = createContext();

export const MeetingsProvider = ({ children }) => {
  const AddMeeting = async (data, token) => {
    const payload = {
      customerId: data.customerId,
      professionalId: data.professionalId,
      meetingDate: data.meetingDate,
      jobInfo: data.jobInfo
    };

    try {
      const response = await fetch('https://localhost:7286/api/Meeting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'accept': '*/*'
        },
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

  const GetAllMeetingsByCustomer = async (customerId, token) => {
    try {
      const response = await fetch(`https://localhost:7286/api/Meeting/customer/${customerId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': '*/*'
        },
      });

      if (!response.ok) {
        const text = await response.text();
        return { success: false, msg: text };
      }

      const data = await response.json();
      return { success: true, data };

    } catch (error) {
      return { success: false, msg: 'Error de conexión con el servidor.' };
    }
  };

  const GetPendingMeetings = async (professionalId, token) => {
    try {
      const response = await fetch(`https://localhost:7286/api/Meeting/professional/${professionalId}/pending`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': '*/*'
        },
      });

      if (!response.ok) {
        const text = await response.text();
        return { success: false, msg: text };
      }

      const data = await response.json();
      return { success: true, data };

    } catch (error) {
      return { success: false, msg: 'Error de conexión con el servidor.' };
    }
  };

  const AcceptMeeting = async (meetingId, token) => {
    try {
      const response = await fetch(`https://localhost:7286/api/Meeting/${meetingId}/accept`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': '*/*'
        },
      });

      if (!response.ok) {
        const text = await response.text();
        return { success: false, msg: text };
      }

      const text = await response.text();
      return { success: true, msg: text };

    } catch (error) {
      return { success: false, msg: 'Error de conexión con el servidor.' };
    }
  };

  const RejectMeeting = async (meetingId, token) => {
    try {
      const response = await fetch(`https://localhost:7286/api/Meeting/${meetingId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': '*/*'
        },
      });

      if (!response.ok) {
        const text = await response.text();
        return { success: false, msg: text };
      }

      const text = await response.text();
      return { success: true, msg: text };

    } catch (error) {
      return { success: false, msg: 'Error de conexión con el servidor.' };
    }
  };

  const CancelMeeting = async (meetingId, token) => {
    try {
      const response = await fetch(`https://localhost:7286/api/Meeting/${meetingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': '*/*'
        },
      });

      if (!response.ok) {
        const text = await response.text();
        return { success: false, msg: text };
      }

      const text = await response.text();
      return { success: true, msg: text };

    } catch (error) {
      return { success: false, msg: 'Error de conexión con el servidor.' };
    }
  };

  const FinalizeMeeting = async (meetingId, token) => {
    try {
      const response = await fetch(`https://localhost:7286/api/Meeting/${meetingId}/finalize`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': '*/*'
        },
      });

      if (!response.ok) {
        const text = await response.text();
        return { success: false, msg: text };
      }

      const text = await response.text();
      return { success: true, msg: text };

    } catch (error) {
      return { success: false, msg: 'Error de conexión con el servidor.' };
    }
  };

  const GetAcceptedMeetings = async (userId, token) => {
    try {
      const response = await fetch(`https://localhost:7286/api/Meeting/status/1?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': '*/*'
        },
      });

      if (!response.ok) {
        const text = await response.text();
        return { success: false, msg: text };
      }

      const data = await response.json();
      return { success: true, data };

    } catch (error) {
      return { success: false, msg: 'Error de conexión con el servidor.' };
    }
  };

  const data = {
    AddMeeting,
    GetAllMeetingsByCustomer,
    GetPendingMeetings,
    GetAcceptedMeetings,
    AcceptMeeting,
    RejectMeeting,
    CancelMeeting,
    FinalizeMeeting
  };

  return <MeetingsContext.Provider value={data}>{children}</MeetingsContext.Provider>;
};

export const useMeetings = () => {
  const context = useContext(MeetingsContext);
  if (!context) {
    throw new Error('useMeetings must be used within a MeetingsProvider');
  }
  return context;
};