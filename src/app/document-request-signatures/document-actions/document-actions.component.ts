import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LocalStorageService } from '../../@service/local-storage.service';
import { EthereumService } from '../../@service/ethereum.service';
import { Signer } from '../../@model/signer.model';
import * as Moment from 'moment';

declare let window: any;

@Component({
  selector: 'app-document-actions',
  templateUrl: './document-actions.component.html',
  styleUrls: ['./document-actions.component.css']
})

export class DocumentActionsComponent implements OnInit {

  docId: string

  currentFile: any

  moment: any

  @Input() signer: Signer = {}

  signers: Array<Signer> = []

  constructor(
    private route: ActivatedRoute,
    private ls: LocalStorageService,
    public eth: EthereumService) {
    this.moment = Moment;
    this.signers = [];

  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.docId = params['ipfsHash'];

      this.currentFile = this.ls.getFile(this.docId);

      this.eth.onETHAddress.subscribe(address => {
        if (!this.currentFile.creatorAddress) {
          this.currentFile.creatorAddress = this.eth.ETHAddress;
          this.ls.storeFile(this.docId, this.currentFile);
        }
      });

      Object.keys(this.currentFile.signers).forEach(key => {
        let signer = this.currentFile.signers[key];

        this.signers.push(signer);
      });
    });
  }

  displaySignersForm(){
    window.$('#new-signer-form').toggleClass('d-none');
    window.$('#add-signer-btn').toggleClass('d-none');
  }

  addSigner(){
    let file = this.ls.getFile(this.docId);

    file.signers[this.signer.ETHAddress] = this.signer;

    this.signers.push(this.signer);

    this.ls.storeFile(this.docId, file);

    this.signer = {};
  }
}
