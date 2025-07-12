import '../assets/css/LoginRegister.css'

export default function GuestLayout({ children }) {
    return (
        <div className="login">
            <div className="wrapper text-white">
                {children}
            </div>
        </div>
    );
}
