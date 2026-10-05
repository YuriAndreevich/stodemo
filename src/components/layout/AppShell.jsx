import { useUi } from '../../context/UiContext';
import { ConfirmDialog, ToastHost } from '../ui'; // Импортируем из index.js
import { MobileNav } from './MobileNav';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';


export function AppShell({ children }) {
    const { activePage } = useUi();

    return (
        <div className="app-shell" data-page={activePage}>
            <Sidebar />

            <main className="main">
                <Topbar />
                <div className="page-content">{children}</div>
            </main>

            <MobileNav />
            <ToastHost />
            {/* <ConfirmDialog /> */}
        </div>
    );
}

export default AppShell;