import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-header',
    standalone: true,
    templateUrl: './header.component.html',
    styleUrl: './header.component.css'
})
export class HeaderComponent {
    @Input() pageTitle: string = '';
    @Input() pageSubtitle: string = '';
    @Input() showAddButton: boolean = false;

    currentDate: string = '';

    ngOnInit(): void {
        this.updateDate();
    }

    updateDate(): void {
        const date = new Date();
        this.currentDate = date.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long'
        });
    }

    onAddClick(): void {
        // Emit event or navigate to modal
    }
}
