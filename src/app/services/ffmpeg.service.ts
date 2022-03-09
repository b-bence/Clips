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


  // Generate 3 screenshots from the first 3 seconds
  const seconds = [1,2,3]
  const commands: string[] = []

  seconds.forEach((second) => {
    commands.push(
    // Run command is added by default at the beginning

     // Input: grab a specific file from the File System (FS)
     '-i', file.name,

     // Output Options
     //-ss: configure the current timestamp. By default it is set to the beginning of the video. Format: hh:mm:ss
    '-ss',`00:00:0${second}`,
    // We refer to images as frames. '1' refers to how many frames we want to capture at the given timestamp
    '-frames:v','1',
    // Resizing the image. -1 will keep the original aspect ratio by calculating the height
    '-filter:v','scale=510:-1',

     // Output: name of the file
     `output_0${second}.png`
    )
  })

  // We are not able to run ffmpeg on the command line and provide options. 
  // It is not installed on our computer. Instead, we are working with a WebAssembly version of ffmpe
  // The ffmpeg package can execute the commands
  // Add options we would run on the command line
  await this.ffmpeg.run(
    ...commands
  )
}

}
