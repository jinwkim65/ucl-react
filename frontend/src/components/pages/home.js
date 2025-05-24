import NavbarComponent from "../NavbarComponent";
import TableComponent from "../TableComponent";

function HomePage() {
    return (
        <>
            <NavbarComponent />
            <div className="container-fluid p-0 main-content">
                <TableComponent />
            </div>
        </>
    )
}

export default HomePage;