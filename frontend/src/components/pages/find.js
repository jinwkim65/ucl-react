import NavbarComponent from "../NavbarComponent";
import FindComponent from "../FindComponent";

function FindPage() {
    return (
        <>
            <NavbarComponent />
            <div className="container-fluid p-0 main-content">
                <FindComponent />
            </div>
        </>
    )
}

export default FindPage;