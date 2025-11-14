
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart, IPropertyPaneConfiguration, PropertyPaneTextField } from '@microsoft/sp-webpart-base';

export interface IArbWebPartProps { formUrl: string; }

export default class ArbWebPart extends BaseClientSideWebPart<IArbWebPartProps> {

  public render(): void {
    const url = this.properties.formUrl || '';
    this.domElement.innerHTML = `
      <div style="border:1px solid #e5e7eb; border-radius:6px; overflow:hidden; height:80vh;">
        <iframe src="${url}" title="TXDPS ARB" style="width:100%; height:100%; border:0;"></iframe>
      </div>`;
  }

  protected get dataVersion(): Version { return Version.parse('1.0'); }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [{
        header: { description: "TXDPS ARB – Configure the hosted form URL" },
        groups: [{
          groupFields: [
            PropertyPaneTextField('formUrl', { label: 'Form URL', description: 'URL to TXDPS ARB index.html in SharePoint library' })
          ]
        }]
      }]
    };
  }
}
