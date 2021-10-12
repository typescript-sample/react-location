import axios from 'axios';
import * as React from 'react';
import { UserAccount } from 'uione';


const url = 'http://localhost:7070/uploads';
const urlGetImg = 'http://localhost:7070/users/image';
interface State {
  success: boolean;
  loading: boolean;
}
const user: UserAccount = JSON.parse(sessionStorage.getItem('authService'));
export const useUpload = () => {
  const [file, setFile] = React.useState<File>(null);
  const [state, setState] = React.useState<State>({
    success: false,
    loading: false
  });
  const upload = () => {
    if (file) {
      setState((pre) => ({...pre, loading: true}));
      const bodyFormData = new FormData();
      bodyFormData.append('file', file);
      bodyFormData.append('id', user.id);
      bodyFormData.append('source', 'google-storage');
      const headers = new Headers();
      headers.append('Content-Type', 'multipart/form-data');
      return axios.post(url, bodyFormData, { headers }).then(async() => {
        setState((pre) => ({...pre, open: false, success: true, loading: false}));
        setFile(null);
      }).catch(() => {
        setState((pre) => ({...pre, loading: false}));
      });
    }
  };
  return { upload, file, setFile, state, setState};
};
export const getImageAvt = async () => {
  let urlImg = '';
  if (user) {
    try {
      const res = await axios
        .get(urlGetImg + `/${user.id}`);
      urlImg = res.data;
      return urlImg;
    } catch (e) {
      return urlImg;
    }
  }
};
export const dataURLtoFile = (dataurl: string, filename: string) => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};
