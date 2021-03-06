import { Component, OnInit } from '@angular/core';
import { IpfsService } from '../../@service/ipfs.service';

@Component({
  selector: 'app-dropzone',
  templateUrl: './dropzone.component.html',
  styleUrls: ['./dropzone.component.css']
})

export class DropzoneComponent implements OnInit {

  dzMessage: any = {value: `
    <i class="fa fa-cloud-upload-alt"></i>
    <h4>Drag a document to upload</h4>
    <p>- or -</p>
    <span class="btn btn-primary">Browse</span>
  `}

  nodeIsReady: boolean = false

  constructor(private ipfs: IpfsService) {
    ipfs.onNodeReady.subscribe(isReady => {
      this.nodeIsReady = isReady;
    });
  }

  ngOnInit() {}

  onUploadError($evt) {
    console.log($evt);
  }

  onUploadSuccess(file) {}

  onFileAdded(file) {
    console.log(file);

    let reader = new FileReader();

    reader.onloadend = () => {
      this.ipfs.fileCount++;
      let fileObj = {
        index: this.ipfs.fileCount,
        name: file.name,
        type: file.type,
        size: file.size,
        progress: 0,
        lastModified: file.lastModified,
        uploadedAt: (new Date()).getTime(),
        status: 'uploaded',
        signers: {},
        creator: {
          email: '',
          ETHAddress: ''
        },
        routes: {},
      };
      this.ipfs.onFileAdded.next(fileObj);
      this.ipfs.queue(reader.result, fileObj);
    }

    reader.readAsArrayBuffer(file);
  }

}
