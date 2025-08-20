import axios from 'axios';
import type { User } from '@/models/Users';


export async function getUsersAccounts(): Promise<User[]> {
  const token = localStorage.getItem('token');
  const res = await axios.get<User[]>(
    `https://api.skantisheh.ir/api/UserAccounts/GetAll`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return res.data;
}