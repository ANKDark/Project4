import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './App.css';
import { BrowserRouter, Route, Routes, useParams, useSearchParams } from 'react-router-dom';
import Home from './Pages/Home';
import UnvDetails from './Pages/UnvDetails';
import Login from './Pages/Auth/Login';
import Register from './Pages/Auth/Register';
import ProfileBlog from './Pages/Profile/ProfileBlog';
import ListAllUserPost from './Pages/ListAllUserPost';
import ForgotPassword from './Pages/Auth/ForgotPassword';
import ResetPassword from './Pages/Auth/ResetPassword';
import VerifyEmail from './Pages/Auth/VerifyEmail';
import SupportUser from './Pages/SupportUser';
import AdminLogin from './Pages/Admin/Auth/AdminLogin';
import VerifyOtp from './Pages/Admin/Auth/VerifyOtp';
import Dashboard from './Pages/Admin/Dashboard';
import UniversityManagement from './Pages/Admin/UniversityManagement';
import CategoryManagement from './Pages/Admin/CategoryManagement';
import AccountManagement from './Pages/Admin/AccountManagement';
import CommentManagement from './Pages/Admin/CommentManagement';
import ProfileManagement from './Pages/Admin/ProfileManagement';
import ChangePassword from './Pages/Admin/Auth/ChangePassword';
import SuggestionManagement from './Pages/Admin/SuggestionManagement';
import SystemErrorsManagement from './Pages/Admin/SystemErrorsManagement';
import Chat from './Pages/Admin/Chat';
import ViolationReportManagement from './Pages/Admin/ViolationReportManagement';
import ProfilePostManagement from './Pages/Admin/ProfilePostManagement';
import ListAdminOnline from './Pages/Admin/ListAdminOnline';

function ResetPasswordWrapper() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const { token } = useParams();

  return <ResetPassword token={token} email={email} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/details/:id" element={<UnvDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile/:id" element={<ProfileBlog />} />
        <Route path="/allposts" element={<ListAllUserPost />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/supportUser" element={<SupportUser />} />
        <Route path="/reset-password/:token" element={<ResetPasswordWrapper />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/verify-otp" element={<VerifyOtp />} />
        <Route path="/admin/index" element={<Dashboard />} />
        <Route path="/admin/indexUnv" element={<UniversityManagement />} />
        <Route path="/admin/listCategory" element={<CategoryManagement />} />
        <Route path="/admin/listAccount" element={<AccountManagement />} />
        <Route path="/admin/listComment" element={<CommentManagement />} />
        <Route path="/admin/profile" element={<ProfileManagement />} />
        <Route path="//admin/listProfilePost" element={<ProfilePostManagement />} />
        <Route path="/admin/changePassword" element={<ChangePassword />} />
        <Route path="/admin/listAdminOnline" element={<ListAdminOnline />} />
        <Route path="/admin/listSuggestionWebsite" element={<SuggestionManagement />} />
        <Route path="/admin/listSystemError" element={<SystemErrorsManagement />} />
        <Route path="/admin/listViolationReport" element={<ViolationReportManagement />} />
        <Route path="/admin/chat" element={<Chat />} />
      </Routes>
    </BrowserRouter>
  );
}