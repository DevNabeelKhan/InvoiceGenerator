import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, NgxChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  summaryCards = [
    { label: 'Total Customers', value: 124, icon: 'fa-solid fa-users', color: '#4f6ef7', route: '/customers' },
    { label: 'Total Beneficiaries', value: 38, icon: 'fa-solid fa-hand-holding-dollar', color: '#12b76a', route: '/beneficiaries' },
    { label: 'Total Products', value: 210, icon: 'fa-solid fa-boxes-stacked', color: '#f79009', route: '/products' },
    { label: 'Total Revenue (SAR)', value: '482,650', icon: 'fa-solid fa-sack-dollar', color: '#7a5af8', route: null },
  ];

  revenueTrend = [
    { name: 'Jan', value: 32000 },
    { name: 'Feb', value: 41000 },
    { name: 'Mar', value: 38500 },
    { name: 'Apr', value: 52000 },
    { name: 'May', value: 47500 },
    { name: 'Jun', value: 61000 },
    { name: 'Jul', value: 58500 },
  ];

  colorScheme: any = {
    domain: ['#4f6ef7', '#12b76a', '#f79009', '#7a5af8', '#f04438']
  };

  recentCustomers = [
    { Code: 'CUST-0001', Name: 'Al Noor Trading Co.', Email: 'info@alnoor.sa', Balance: '12,500.00', Status: true },
    { Code: 'CUST-0002', Name: 'Ahmed Ali', Email: 'ahmed@email.com', Balance: '0.00', Status: true },
    { Code: 'CUST-0003', Name: 'Global Solutions', Email: 'contact@global.sa', Balance: '8,750.00', Status: true },
    { Code: 'CUST-0004', Name: 'Fatima Stores', Email: 'info@fatima.sa', Balance: '3,450.00', Status: false },
    { Code: 'CUST-0005', Name: 'Website Clients', Email: 'client@web.sa', Balance: '1,200.00', Status: true },
  ];

  recentProducts = [
    { SKU: 'KB-001', Name: 'Wireless Keyboard', Category: 'Electronics', Price: '150.00', Stock: 48, Status: true },
    { SKU: 'MS-001', Name: 'Wireless Mouse', Category: 'Electronics', Price: '85.00', Stock: 0, Status: false },
    { SKU: 'CB-001', Name: 'USB-C Cable', Category: 'Accessories', Price: '25.00', Stock: 120, Status: true },
    { SKU: 'SV-001', Name: 'Website Support', Category: 'Services', Price: '500.00', Stock: null, Status: true },
    { SKU: 'CH-001', Name: 'Office Chair', Category: 'Furniture', Price: '450.00', Stock: 6, Status: true },
  ];
}
