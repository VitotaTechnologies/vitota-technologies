import { prisma } from '@/lib/prisma';
import { DashboardCard } from '@/components/admin/DashboardCard';
import { Users, Inbox, AlertCircle, FolderKanban, CheckCircle, CreditCard, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default async function AdminDashboardPage() {
  const [
    totalLeads, urgentLeads, newLeads, totalClients,
    activeProjects, completedProjects, pendingPayments, revenueAgg,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { urgent: true, status: { notIn: ['CLOSED', 'CONVERTED'] } } }),
    prisma.lead.count({ where: { status: 'NEW' } }),
    prisma.user.count({ where: { role: 'CLIENT' } }),
    prisma.project.count({ where: { status: { not: 'COMPLETED' }, archived: false } }),
    prisma.project.count({ where: { status: 'COMPLETED' } }),
    prisma.payment.count({ where: { status: 'PENDING' } }),
    prisma.payment.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
  ]);

  const revenue = Number(revenueAgg._sum.amount ?? 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard label="Total Leads" value={totalLeads} icon={Inbox} />
        <DashboardCard label="Urgent Leads" value={urgentLeads} icon={AlertCircle} tone="danger" />
        <DashboardCard label="New Leads" value={newLeads} icon={Inbox} tone="primary" />
        <DashboardCard label="Total Clients" value={totalClients} icon={Users} />
        <DashboardCard label="Active Projects" value={activeProjects} icon={FolderKanban} tone="primary" />
        <DashboardCard label="Completed Projects" value={completedProjects} icon={CheckCircle} tone="success" />
        <DashboardCard label="Pending Payments" value={pendingPayments} icon={CreditCard} tone="warning" />
        <DashboardCard label="Total Revenue" value={formatCurrency(revenue)} icon={TrendingUp} tone="success" />
      </div>
    </div>
  );
}