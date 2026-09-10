import { Routes, Route, Navigate } from 'react-router-dom';
import SiteLayout from './components/SiteLayout';
import AppShell from './components/AppShell';
import { companyNav, employeeNav } from './components/nav';
import { RequireAuth } from './lib/auth';

import Home from './pages/Home';
import Pricing from './pages/Pricing';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

import Dashboard from './pages/company/Dashboard';
import Employees from './pages/company/Employees';
import Absences from './pages/company/Absences';
import Planning from './pages/company/Planning';
import Onboarding from './pages/company/Onboarding';
import Documents from './pages/company/Documents';
import Reviews from './pages/company/Reviews';
import Skills from './pages/company/Skills';
import Billing from './pages/company/Billing';
import Compliance from './pages/company/Compliance';
import AIAssistant from './pages/company/AIAssistant';
import Settings from './pages/company/Settings';

import EmpDashboard from './pages/employee/Dashboard';
import EmpDocuments from './pages/employee/Documents';
import EmpPayslips from './pages/employee/Payslips';
import EmpRequests from './pages/employee/Requests';
import EmpPlanning from './pages/employee/Planning';
import EmpProfile from './pages/employee/Profile';
import EmpAssistant from './pages/employee/Assistant';

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/tarifs" element={<Pricing />} />
      </Route>
      <Route path="/connexion" element={<Login />} />

      <Route
        path="/app"
        element={
          <RequireAuth space="entreprise">
            <AppShell nav={companyNav} space="entreprise" />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="salaries" element={<Employees />} />
        <Route path="absences" element={<Absences />} />
        <Route path="planning" element={<Planning />} />
        <Route path="onboarding" element={<Onboarding />} />
        <Route path="documents" element={<Documents />} />
        <Route path="entretiens" element={<Reviews />} />
        <Route path="competences" element={<Skills />} />
        <Route path="facturation" element={<Billing />} />
        <Route path="conformite" element={<Compliance />} />
        <Route path="ia" element={<AIAssistant />} />
        <Route path="parametres" element={<Settings />} />
      </Route>

      <Route
        path="/espace"
        element={
          <RequireAuth space="salarié">
            <AppShell nav={employeeNav} space="salarié" />
          </RequireAuth>
        }
      >
        <Route index element={<EmpDashboard />} />
        <Route path="documents" element={<EmpDocuments />} />
        <Route path="bulletins" element={<EmpPayslips />} />
        <Route path="demandes" element={<EmpRequests />} />
        <Route path="planning" element={<EmpPlanning />} />
        <Route path="profil" element={<EmpProfile />} />
        <Route path="assistant" element={<EmpAssistant />} />
      </Route>

      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
