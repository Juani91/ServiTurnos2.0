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

  const data = {
    AddMeeting,
    GetAllMeetingsByCustomer
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