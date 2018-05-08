import { Component, OnInit, Input, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LocalStorageService } from '@service/local-storage.service';
import { EthereumService } from '@service/ethereum.service';
import { Signer } from '../../@model/signer.model';
import * as Moment from 'moment';

declare let window: any;
declare let require: any;

const _ = require('lodash');

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

  creator: any = {}

  signers: Array<Signer> = []

  contract: any

  constructor(
    private route: ActivatedRoute,
    private ls: LocalStorageService,
    public eth: EthereumService,
    private zone: NgZone) {
    this.moment = Moment;
    this.signers = [];

    eth.onSignDocument.subscribe(data => {
      this.currentFile = data.currentFile ? data.currentFile : this.currentFile;

      this.getDocumentData();
    });

    eth.onContractInstanceReady.subscribe(contract => {
      this.getDocumentData();
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.docId = params['ipfsHash'];

      this.currentFile = this.ls.getFile(this.docId);

      if (this.eth.CanSignContract) {
        this.getDocumentData();
      } else {
        this.eth.setContract();
      }
    });
  }

  isSigned(){
    return this.currentFile.status === 'signed';
  }

  getDocumentData(){
    let contract = this.eth.CanSignContract;

    let docId = this.docId;

    let canSignDocument = false;

    contract.getDocumentCreator(docId).then(creator => {
      this.creator.ETHAddress = creator;
    });

    contract.getDocumentSigners(docId).then(_signers => {
      this.signers = [];
      let signers = {};

      _signers.push(this.creator.ETHAddress);

      canSignDocument = _signers.map(address => address.toUpperCase()).indexOf(this.eth.ETHAddress.toUpperCase()) != -1;

      _signers.pop();

      if (!canSignDocument) {
        this.eth.onSignatureDenial.next({
          displayOnSignatureDenialModal: true,
          denyDocumentView: true,
        });

        return false;
      }

      _signers.forEach(address => {
        signers[address] = {
          ETHAddress: address,
        };
      });

      _.forEach(signers, (signer, address) => {
        contract.getSignerEmail(docId, address).then(email => signer.email = email);
        contract.getSignerTimestamp(docId, address).then(timestamp => signer.timestamp = timestamp.valueOf());
        contract.getSignerStatus(docId, address).then(status => signer.status = status);
        signer.tx = this.currentFile.signers[address.toUpperCase()].tx;
        this.signers.push(signer);
      });

      this.zone.run(() => console.log('ran'));

    }).catch(error => console.log(error));
  }
}
