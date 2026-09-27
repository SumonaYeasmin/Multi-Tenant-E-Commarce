
export default function DashboardLayout({
    children
}: {
    children: React.ReactNode;
}) {
    return (
        <div>
            {/* All roles will share a common layout file here — common for all the roles */}
            {children}
        </div>
    );
}