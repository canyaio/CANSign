import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LocalStorageService } from '@service/local-storage.service';
import { EthereumService } from '@service/ethereum.service';
import { SharedService } from '@service/shared.service';
import { Document } from '@model/document.model';
import * as Moment from 'moment';

declare let window: any;
declare let require: any;

const validator = require('validator');

@Component({
  selector: 'app-document-actions',
  templateUrl: './document-actions.component.html',
  styleUrls: ['./document-actions.component.css']
})

export class DocumentActionsComponent implements OnInit {

  docId: string

  currentFile: Document = new Document

  moment: any

  @Input() creator: any = {}

  canRequestSignatures: boolean = true

  onRequestSignaturesFailMessage: string

  isValidCreatorEmail: boolean = true
  invalidCreatorEmailMessage: string

  constructor(
    private route: ActivatedRoute,
    private ls: LocalStorageService,
    public eth: EthereumService,
    public shared: SharedService) {
    this.moment = Moment;
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.docId = params['ipfsHash'];

      this.ls.getDocument(this.docId).then(doc => {
        this.currentFile = doc
        this.creator.email = this.currentFile.creator.email
      })
    });
  }

  openPublishDocumentModal(){
    this.eth.getETHAddress()

    this.ls.getDocument(this.docId).then((document: Document) => {
      if (!document.signers || Object.keys(document.signers).length <= 0) {
        this.canRequestSignatures = false
        this.onRequestSignaturesFailMessage = 'documents-request.at-least-1-signer'
        return false
      }

      if (!this.creator.email) {
        this.canRequestSignatures = false
        this.onRequestSignaturesFailMessage = 'documents-request.add-notification-email'
        return false
      }

      this.canRequestSignatures = true
      this.onRequestSignaturesFailMessage = ''

      this.eth.openPublishDocumentModal()
    })
  }

  addNotificationEmail(){
    if (!this._isValidCreatorEmail()) return false

    this.isValidCreatorEmail = true
    this.invalidCreatorEmailMessage = ''

    let file = this.ls.getFile(this.docId)

    file.creator.email = this.creator.email

    this.ls.storeFile(this.docId, file)

    this.ls.updateDocument(this.docId, {creator: this.creator})

    window.$('#btn-add-email').html('<i class="fa fa-check"></i>')
  }

  _isValidCreatorEmail(): boolean {
    if (typeof this.creator.email != 'string' || !validator.isEmail(this.creator.email)) {
      this.isValidCreatorEmail = false
      this.invalidCreatorEmailMessage = 'documents-request.invalid-email-address'

      return false
    }

    let signers = this.currentFile.signers ? Object.keys(this.currentFile.signers) : []

    let emailExists = signers.map(address => {
      let signer = this.currentFile.signers[address]
      return signer.email;
    }).indexOf(this.creator.email) != -1

    if (emailExists) {
      this.isValidCreatorEmail = false
      this.invalidCreatorEmailMessage = 'documents-request.email-equals-another-email'

      return false
    }

    return true
  }

  addExpirationDate(){}
}
