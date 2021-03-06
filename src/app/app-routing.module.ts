import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DocumentsIndexWrapperComponent } from './document-index/documents-index-wrapper/documents-index-wrapper.component';
import { DocumentsSignWrapperComponent } from './document-sign/documents-sign-wrapper/documents-sign-wrapper.component';
import { DocumentsRequestSignaturesWrapperComponent } from './document-request-signatures/documents-request-signatures-wrapper/documents-request-signatures-wrapper.component';
import { ContainerComponent as MissingMetamaskComponent } from './missing-metamask/container.component';
import { EthereumService } from '@service/ethereum.service';
import { MissingMetamaskGuard } from '@guard/missing-metamask.guard'

const routes: Routes = [
  { path: '', redirectTo: '/documents/index', pathMatch: 'full' },
  { path: 'documents/index',
    component: DocumentsIndexWrapperComponent,
    canActivate: [MissingMetamaskGuard],
    resolve: {
      contract: EthereumService
    }
  },
  { path: 'documents/:ipfsHash/sign',
    component: DocumentsSignWrapperComponent,
    canActivate: [MissingMetamaskGuard],
    resolve: {
      contract: EthereumService
    }
  },
  { path: 'documents/:ipfsHash/request-signatures',
    component: DocumentsRequestSignaturesWrapperComponent,
    canActivate: [MissingMetamaskGuard],
    resolve: {
      contract: EthereumService
    }
  },
  { path: 'missing-metamask',
    component: MissingMetamaskComponent,
  },
]

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})

export class AppRoutingModule { }
