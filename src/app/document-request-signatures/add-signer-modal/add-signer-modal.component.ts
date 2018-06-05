import { Component, OnInit, Input } from '@angular/core';
import { SharedService } from '@service/shared.service';
import { EthereumService } from '@service/ethereum.service';
import { LocalStorageService } from '@service/local-storage.service';
import { ActivatedRoute } from '@angular/router';
import { Signer } from '@model/signer.model';

declare let window: any;
declare let require: any;

const Web3 = require('web3');
const validator = require('validator');

@Component({
  selector: 'app-add-signer-modal',
  templateUrl: './add-signer-modal.component.html',
  styleUrls: ['./add-signer-modal.component.css']
})

export class AddSignerModalComponent implements OnInit {

  docId: string

  currentFile: any

  display: boolean = false

  onAddSigner: boolean = false
  onSignersList: boolean = false

  signers: Array<Signer> = []

  @Input() signer: Signer = {}

  creator: any = {}

  isValidSignerAddress: boolean = true

  invalidSignerAddressMessage: string

  isValidSignerEmail: boolean = true

  invalidSignerEmailMessage: string

  constructor(
    public shared: SharedService,
    private route: ActivatedRoute,
    public eth: EthereumService,
    private ls: LocalStorageService) {

    this.signers = [];

    shared.onSignersModal.subscribe(data => {
      this.display = data.display
      this.onAddSigner = data.onAddSigner
      this.onSignersList = data.onSignersList
    })
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.docId = params['ipfsHash'];

      this.currentFile = this.ls.getFile(this.docId);

      this.creator.email = this.currentFile.creator.email;

      Object.keys(this.currentFile.signers).forEach(key => {
        let signer = this.currentFile.signers[key];

        this.signers.push(signer);
      });
    });
  }

  addSigner(){
    if (!this._isValidSignerAddress()) return false;

    this.isValidSignerAddress = true;
    this.invalidSignerAddressMessage = '';

    if (!this._isValidSignerEmail()) return false;

    this.isValidSignerEmail = true;
    this.invalidSignerEmailMessage = '';

    let file = this.ls.getFile(this.docId);

    this.signer.status = 'pending';

    file.signers[this.signer.ETHAddress.toUpperCase()] = this.signer;

    this.signers.push(this.signer);

    this.ls.storeFile(this.docId, file);

    this.signer = {};

    this.onAddSigner = false;
    this.onSignersList = true;
  }

  _isValidSignerAddress(): boolean {
    if (!Web3.utils.isAddress(this.signer.ETHAddress)) {
      this.isValidSignerAddress = false;
      this.invalidSignerAddressMessage = 'Address is not a valid HEX Ethereum address';

      return false;
    }

    if (this.signer.ETHAddress.toUpperCase() === this.eth.ETHAddress.toUpperCase()) {
      this.isValidSignerAddress = false;
      this.invalidSignerAddressMessage = 'Address should not be equal to the document creator address';

      return false;
    }

    let addressExists = this.signers.map(signer => {
      return signer.ETHAddress.toUpperCase();
    }).indexOf(this.signer.ETHAddress.toUpperCase()) != -1;

    if (addressExists) {
      this.isValidSignerAddress = false;
      this.invalidSignerAddressMessage = 'Address should not match another signer address';

      return false;
    }

    return true;
  }

  _isValidSignerEmail(): boolean {
    if (typeof this.signer.email != 'string' || !validator.isEmail(this.signer.email)) {
      this.isValidSignerEmail = false;
      this.invalidSignerEmailMessage = 'Email is not a valid email address';

      return false;
    }

    if (this.signer.email === this.creator.email) {
      this.isValidSignerEmail = false;
      this.invalidSignerEmailMessage = 'Email should not be equal to the document creator email';

      return false;
    }

    let emailExists = this.signers.map(signer => {
      return signer.email;
    }).indexOf(this.signer.email) != -1;

    if (emailExists) {
      this.isValidSignerEmail = false;
      this.invalidSignerEmailMessage = 'Email should not match another signer email';

      return false;
    }

    return true;
  }

}