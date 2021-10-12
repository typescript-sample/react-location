import axios from 'axios';
import { UserAccount } from 'uione';
import { FileUploads, Uploads } from './model';

const url = 'http://localhost:7070';
const user: UserAccount = JSON.parse(sessionStorage.getItem('authService'));
export const fetchImageUploaded = (): Promise<FileUploads[]>  => {
  if (user) {
    return axios.get(url + `/uploads/${user.id}`).then(files => {
      return files.data as FileUploads[];
    });
  }
};
export const deleteFile = (fileUrl: string): Promise<number> => {
  if (user) {
    return axios.delete(url + `/uploads?userId=${user.id}&url=${fileUrl}`).then(() => {
      return 1;
    }).catch(() => 0);
  }
};
export const deleteFileYoutube = (fileUrl: string): Promise<number> => {
  if (user) {
    return axios.delete(url + `/uploads/youtube?userId=${user.id}&url=${fileUrl}`).then(() => {
      return 1;
    }).catch(() => 0);
  }
};
export const uploadVideoYoutube = (videoId: string  ): Promise<number> => {
  const body: Uploads = {
    userId: user.id,
    data: [{
      source: 'youtube',
      type: 'video',
      url: 'https://www.youtube.com/embed/' + videoId
    }]
  };
  const headers = new Headers();
  return axios.post(url + '/uploads/youtube', body, {headers}).then(() => 1).catch(() => 0);
};
export const getUser = (): Promise<string> => {
  return axios.get(url + '/image/users/' + user.id).then(r => r.data).catch(e => e);
};
export const updateData = (data: FileUploads[]): Promise<number> => {
  const body = {
    data,
    userId: user.id
  };
  return axios.patch(url + '/uploads', body).then(r => r.data as number).catch(e => e);
};

