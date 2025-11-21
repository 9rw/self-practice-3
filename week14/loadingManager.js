export class LoadingManager {
  constructor() {
    this.loadingElement = null;
    this.buttonGroup = null;
  }

  init(loadingElementId, buttonGroupId) {
    this.loadingElement = document.getElementById(loadingElementId);
    this.buttonGroup = document.getElementById(buttonGroupId);
  }

  showLoading() {
    if (this.loadingElement) {
      this.loadingElement.style.display = 'block';
    }
    this.disableButtons();
  }

  hideLoading() {
    if (this.loadingElement) {
      this.loadingElement.style.display = 'none';
    }
    this.enableButtons();
  }

  disableButtons() {
    if (this.buttonGroup) {
      const buttons = this.buttonGroup.querySelectorAll('button');
      buttons.forEach(button => {
        button.disabled = true;
      });
    }
  }

  enableButtons() {
    if (this.buttonGroup) {
      const buttons = this.buttonGroup.querySelectorAll('button');
      buttons.forEach(button => {
        button.disabled = false;
      });
    }
  }
}

export const loadingManager = new LoadingManager();
