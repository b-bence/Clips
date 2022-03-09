import { Injectable } from '@angular/core';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

@Injectable({
  providedIn: 'root'
})
export class FfmpegService {
  isReady = false;
  private ffmpeg

  constructor() { 
    this.ffmpeg = createFFmpeg({
      log:true
    })
  }
async init(){
  if(this.isReady){
    return 
  }

  await this.ffmpeg.load()

  this.isReady = true
}

async getScreenshots(file: File){
  // fetchFile will convert the data to binary data
  const data = await fetchFile(file)

  // Storing the data in memory
  // Gives us access to an independent memory system. Ffmpeg is creating a seperate memory system for files. Without a seperate system, file loading would be slower
  // First we have to write to FS (File System) to access files from there
  this.ffmpeg.FS("writeFile",file.name, data)
}

}
