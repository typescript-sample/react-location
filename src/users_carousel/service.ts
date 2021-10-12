import axios from 'axios';
import { UserAccount } from 'uione';
import { FileUploads, Thumbnail } from './model';

const url = 'http://localhost:7070';
const urlYutuServece = 'http://localhost:8081';
const user: UserAccount = JSON.parse(sessionStorage.getItem('authService'));
export const fetchImageUploaded = (id): Promise<FileUploads[]>  => {
  if (user) {
    return axios.get(url + `/uploads/${id}`).then(files => {
      return files.data as FileUploads[];
    });
  }
};

export const fetchThumbnailVideo = (videoId): Promise<Thumbnail> => {
  return axios.get(urlYutuServece + `/tube/video/${videoId}&thumbnail,standardThumbnail,mediumThumbnail,maxresThumbnail,highThumbnail`).then(thumbnail => {
    return thumbnail.data as Thumbnail;
  });
};
