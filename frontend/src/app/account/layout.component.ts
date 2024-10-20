import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
    standalone: true,
    imports: [RouterModule],
    templateUrl: './layout.component.html',
})
export class LayoutComponent {
    constructor(private router: Router) {}
}
