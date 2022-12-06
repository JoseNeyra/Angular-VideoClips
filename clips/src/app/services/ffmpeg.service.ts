import { Injectable } from '@angular/core';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import { readFile } from 'fs';

@Injectable({
  providedIn: 'root'
})
export class FfmpegService {

  isReady: boolean = false
  private ffmpeg
  isRunning: boolean = false

  constructor() {
    this.ffmpeg = createFFmpeg({ log: true })
  }

  async init() {
    if (this.isReady) {
      return
    }

    await this.ffmpeg.load()
    this.isReady = true
  }

  async getScreenshots(file: File) {
    this.isRunning = true
    const data = await fetchFile(file)   // Convert the file to UInt8Array promise
    this.ffmpeg.FS('writeFile', file.name, data)     // Write the file to the file system using the FS function

    const seconds = [1, 2, 3]         // Defines the seconds we will use for our screenshots
    const commands: string[] = []

    seconds.forEach(second => {
      commands.push(
        // Input
        '-i', file.name,      // Process the file stored in the file system

        // Output Options
        '-ss', `00:00:0${second}`,    //'hh:mm:ss' screenshot the first second of the video
        '-frames:v', '1',    // take only 1 screenshot
        '-filter:v', 'scale=510:-1',      // Rescale the image to 510 height while keeping the aspect ratio

        // Output
        `output_0${second}.png`       // Save the screenshot with this file name
      )
    })

    await this.ffmpeg.run(
      ...commands       // Passes in the arguments in the commands arrays
    )

    const screenshots: string[] = []

    seconds.forEach(second => {
      const screenshotFile = this.ffmpeg.FS(
        'readFile', `output_0${second}.png`
      )

      const screenshotBlob = new Blob(
        [screenshotFile.buffer], {
        type: 'image/png'}
      )

      const screenshotURL = URL.createObjectURL(screenshotBlob)

      screenshots.push(screenshotURL)
    })

    this.isRunning = false
    return screenshots
  }

  async blobFromURL(url: string) {
    const response = await fetch(url)
    const blob = await response.blob()

    return blob
  }
}
