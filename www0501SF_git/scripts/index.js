// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in cordova-simulate or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
(function () {
    "use strict";

    document.addEventListener( 'deviceready', onDeviceReady.bind( this ), false );
    
    function onDeviceReady() {
        // Handle the Cordova pause and resume events
        document.addEventListener( "pause", onPause.bind( this ), false );
        document.addEventListener( "resume", onResume.bind( this ), false );
        //Capture the event of Back Button Press to prevent it from Logging people out
        document.addEventListener("backbutton", function (event) { onBackKeyDown(event); });          
        
        // TODO: Cordova has been loaded. Perform any initialization that requires Cordova here.
        console.log("Cordova is ready!");
        // Show the splashscreen some amount of time, based on device,
        // then .hide() it after Cordova Library loads into memory.
        navigator.splashscreen.hide();  

        // ----- VARIABLES ----- //
        // Create JS Objects (Variables) of various HTML Nodes (elements)
        // Plain Old JavaScript way to do it:
        // var elFormSignUp = document.getElementById("formSignUp");
        // The jQuery way to do it:
        var $elFormSignUp = $("#formSignUp"),
            $elPopErrorSignUpMismatch = $("#popErrorSignUpMismatch"),
            $elPopErrorSignUpExists = $("#popErrorSignUpExists"),
            $elPopSuccessSignUp = $("#popSuccessSignUp"),
            $elFormLogIn = $("#formLogIn"),
            $elPopErrorLogInNotExists = $("#popErrorLogInNotExists"),
            $elPopErrorLogInWrongPass = $("#popErrorLogInWrongPass"),
            $elBtnLogOut = $("#btnLogOut"),
            $elUserEmail = $(".userEmail");
        /*
            After creating a jQuery-based Variable, you cannot, then,
            use Plain Old JavaScript Methods (commands) on them.
            And vice-versa. So, it's good practice to add $ in front of the var
            to denote this! We use jQ for its ubiquity, and it's compact,
            updated constantly, great standard.
        */
        // A reusable function to create, or re-create a PouchDB Databse
        function initDB()
             {
            console.log("initDB() is running");
            /*
                Every user has their own Database, and it's named
                after their email address. Therefore, it is based on
                the current user logged in (isLoggedIn).
                This is a local scope Object, that can only be used
                in THIS function, as long as it's running.
            */
            var currentDB = localStorage.getItem("isLoggedIn");

            // Then create a new database with their email
            db = new PouchDB(currentDB);

            // Return the Database Object to the Global Scope
            // So that we can use that Object anywere else in the app
            return db;
        } // END initDB()
        /* 
            Check to see if user is logged in, as soon as Apps starts
            If they are, send them to #pgHome
            If they're NOT, send them to #pgWelcome
            The following is NOT in a Fuction because we want it to
             execute as soon as the App starts
        */
        if (localStorage.getItem("isLoggedIn") === "" || localStorage.getItem("isLoggedIn") === undefined || localStorage.getItem("isLoggedIn") === null) {
            // We just checked 3 possibilities with OR || to confirm no one logged in
            console.log("No User logged in.");
            // $(":mobile-pagecontainer").pagecontainer("change", "#pgWelcome");
        } else {
            // A person is logged in, therefore initialize the DB
            initDB();
            // A user exists, therefore, show their comics
            fnShowComicsPrep();
            console.log("User IS logged in.");
            $elUserEmail.html(localStorage.getItem("isLoggedIn"));
            $(":mobile-pagecontainer").pagecontainer("change", "#pgHome");
        } // END If..Else to check if User is logged in our out

        // *****----- FUNCTIONS -----***** //
        // After a person Submits the Sign Up form, perform more actions
        // Create a function that runs after the person clicks Submit
        // No ending ; necessary. Pass in an event Parameter
        function fnSignUp(event) {
            // Prevent the default behavior of refreshing the screen
            event.preventDefault();
            console.log("We clicked Sign Up");

            // Create Objects based on HTML Nodes
            var $elInEmailSignUp = $("#inEmailSignUp"),
                $elInPasswordSignUp = $("#inPasswordSignUp"),
                $elInPasswordConfirmSignUp = $("#inPasswordConfirmSignUp");
            // Console output to show what the value of those
            // fields are, using the jQ Method .val()
            console.log("Email: " + $elInEmailSignUp.val());
            console.log("PW: " + $elInPasswordSignUp.val());
            console.log("Confirm PW: " + $elInPasswordConfirmSignUp.val());

            // Conditional Statement to check if passwords match, or not
            if ($elInPasswordSignUp.val() !== $elInPasswordConfirmSignUp.val()) {
                // If something is TRUE, execute the code in this block
                console.log("Passwords DON'T MATCH!");
                // Make a jQM popup appear on-screen.
                // First, initialize it, then show it on screen with options
                $elPopErrorSignUpMismatch.popup();
                $elPopErrorSignUpMismatch.popup("open", { "transition": "flip" });
                // Then clear out the fields, but writing NOTHING into them
                // .val() jQ Method can be used to read or write data
                $elInPasswordSignUp.val("");
                $elInPasswordConfirmSignUp.val("");
            } else {
                // Or, else, it's FALSE, so execute code in this block
                console.log("Password DO match!!!");
                // Temporary copies of their emai/pw that have been turned Uppercase
                var tmpValInEmailSignUp = $elInEmailSignUp.val().toUpperCase(),
                    tmpValInPasswordSignUp = $elInPasswordSignUp.val().toUpperCase();

                // Using HTML5 LocalStorage, we can save data to the user's device
                // in a sort of "Cookie" manner. 
                // localStorage.setItem("username", "janet");
                //
                /* 
                    Check in the Local Storage area of the device to see if there
                    is data in a 'cookie' named 'the person's email', to determine
                    if the User Account exists. (check equality and type)
                */
                if (localStorage.getItem(tmpValInEmailSignUp) === null) {
                    console.log("User doesn't exist");
                    // User doesn't exist, so save the User Account
                    localStorage.setItem(tmpValInEmailSignUp, tmpValInPasswordSignUp);
                    console.log("User saved: " + tmpValInEmailSignUp);
                    // After successfully saving a new user, reset the whole form
                    $elFormSignUp[0].reset();
                    $elPopSuccessSignUp.popup();
                    $elPopSuccessSignUp.popup("open", { "transition": "flip" });
                } else {
                    console.log("User DOES exist");
                    $elPopErrorSignUpExists.popup();
                    $elPopErrorSignUpExists.popup("open", { "transition": "flip" });
                } // END If..Else statement to check if User exists
            } // END If..Else statement if Passwords match
        } // END fnSignUp()

        function fnLogIn(event) {
            event.preventDefault();
            console.log("Running fnLogIn()");

            // Create Objects of the Input fields in the Log In screen,
            // then create temporary Variables (Objects) that have been Uppercased
            var $elInEmailLogIn = $("#inEmailLogIn"),
                $elInPasswordLogIn = $("#inPasswordLogIn"),
                tmpValInEmailLogIn = $elInEmailLogIn.val().toUpperCase(),
                tmpValInPasswordLogIn = $elInPasswordLogIn.val().toUpperCase();

            console.log("Email was: " + tmpValInEmailLogIn);
            console.log("Password was: " + tmpValInPasswordLogIn);

            // If..Else to check if User exists in Local Storage
            if (localStorage.getItem(tmpValInEmailLogIn) === null) {
                console.log("User doesn't exist: " + tmpValInEmailLogIn);
                $elPopErrorLogInNotExists.popup();
                $elPopErrorLogInNotExists.popup("open", { "transition": "flip" });
            } else {
                console.log("User DOES exist: " + tmpValInEmailLogIn);
                if (tmpValInPasswordLogIn === localStorage.getItem(tmpValInEmailLogIn)) {
                    console.log("Passwords DO match");
                    // Before we change screens, write into any (Element) Node
                    // named .userEmail, the person's email
                    $elUserEmail.html(tmpValInEmailLogIn.toLowerCase());
                    // jQuery syntax to move from jQM screen, to jQM screen
                    $(":mobile-pagecontainer").pagecontainer("change", "#pgHome", { "transition": "flip" });
                    // Set a Local Storage cookie of WHO has logged in
                    localStorage.setItem("isLoggedIn", tmpValInEmailLogIn);
                    // User exists, and logs in, therefore, use their Database
                    initDB();
                    // Show their comics on-screen
                    fnShowComicsPrep();
                } else {
                    console.log("Passwords DON'T MATCH!!");
                    $elPopErrorLogInWrongPass.popup();
                    $elPopErrorLogInWrongPass.popup("open", { "transition": "flip" });
                    $elInPasswordLogIn.val("");
                } // END If..Else to check if Passwords match
            } // END If..Else to check if User exists in Local Storage
        } // END fnLogIn()

        function fnLogOut() {
            console.log("fnLogOut() is running");
            // Conditional Statement to confirm a log out
            // Switch Statement checks X number of known possibilities
            // and executes a result based on one of them 
            // (or a default 'if all else fails' possibility
            switch (confirm("Are you sure you want to log out?")) {
                case true:
                    console.log("They DO want to log out!");
                    // Person logs out, and we reset the Log In Form
                    $elFormLogIn[0].reset();
                    // Via jQ move them to the Welcome screen
                    $(":mobile-pagecontainer").pagecontainer("change", "#pgWelcome");
                    // Mark in memory that the current user has LOGGED OUT
                    localStorage.setItem("isLoggedIn", "");
                    console.log("User logged out");
                    break;
                case false:
                    console.log("They DO NOT want to log out.");
                    break;
                default:
                    // A possiblity we didn't account for
                    console.log("An unknown possibility??!");
                    break;
            } // END Switch checking if they really want to log out or not
        } // END fnLogOut()

        // ----- PouchDB Code START ---- //

        // Create an uninitialized database Object, in the Global Scope.
        var db;
        // Create Variables (Objects based on the Save Comic Form)
        var $elFormSaveComic = $("#formSaveComic");
        // Create Object for displaying the Comic data on-screen:
        var $elDivShowComicsTable = $("#divShowComicsTable");
        // Create Object for deleting the Comic Collection (the Db)
        var $elBtnDeleteCollection = $("#btnDeleteCollection");
        // Global Scope Variable to keep track of which comic to Delete or Edit
        var tmpComicToDelete;
        // Object for the Delete Comic Button
        var $elBtnDeleteComic = $("#btnDeleteComic");
        // Objects for preparation of editing a comic
        var $elBtnEditComicPrep = $("#btnEditComicPrep");
        var $elBtnEditComicCancel = $("#btnEditComicCancel");
        var $elFormEditComicsInfo = $("#formEditComicsInfo");
        // Objects for scanning barcode and taking photo
        // NOTE: Remember to activate the correct Plugins in config.xml first
        var $elBtnScanBarcode = $("#btnScanBarcode");
        var $elBtnTakePhoto = $("#btnTakePhoto");

        // Function to check the first Word of the Comic Name
        function fnGetFirstWord(str) {
            if (str.indexOf(" ") === -1 ) {
                // if there is Not an empty space, this is a one-word title
                // Do nothing
                console.log("A one word title");
                return str;
            } else {
                // There IS an empty space, therefor, multi-word title
                // Extract that first word.
                console.log("A multi-word title");
                return str.substr(0, str.indexOf(" "));


            }  // END if..Else if the Name of Comic is single word or not

        } // END fnGetFirstWord(str)

        
        // Function to prepare the Comic data, before saving to DB
        function fnPrepComic() {
            var $valInTitle = $("#inTitle").val(),
                $valInNumber = $("#inNumber").val(),
                $valInYear = $("#inYear").val(),
                $valInPublisher = $("#inPublisher").val(),
                $valInNotes = $("#inNotes").val(),
                $valInBarcode = $("#inBarcode").val(),
                $valInPhoto = $("#inPhoto").val();


            // Temporary version to the Title of the Comic
            // ID1  = only first Word, uppercase
            // ID2 = the whole name, uppercase
            // ID3 = new version of the name, without the First Word
            var tmpID1 = fnGetFirstWord($valInTitle.toUpperCase()),
                tmpID2 = $valInTitle.toUpperCase(),
                tmpID3 = "";

            // A Swith to check for existance of "A" "The" etc and remove as necessary
            switch (tmpID1) {
                case "THE":
                    console.log("Comic has THE in title");
                    // 1. Update temp Title w/o the word "The" & the empty space
                    tmpID3 = tmpID2.replace("THE ", "");
                    // 2. Then only keep the first three letters of the cleaned up Title
                    tmpID3 = tmpID3.substr(0, 3);
                    console.log(tmpID3);
                    break;
                case "A":
                    console.log("Comic has A in title");
                    tmpID3 = tmpID2.replace("A ", "");
                    tmpID3 = tmpID3.substr(0, 3);
                    console.log(tmpID3);
                    break;
                case "AN":
                    console.log("Comic has AN in title");
                    tmpID3 = tmpID2.replace("AN ", "");
                    tmpID3 = tmpID3.substr(0, 3);
                    console.log(tmpID3);
                    break;
                default:
                    console.log("Comic has none of these in title");
                    // Since no replace words happended, extract from the unedited version of Title
                    tmpID3 = tmpID2.substr(0, 3);
                    console.log(tmpID3);
                    break;
            } // END Swith, checking for "A" "The" etc

            // Bundled comic data in JSON format for PouchDB
            // For PouchDB we MUST have an "_id" field
            // FYI .replace(/s/g, "") means find any instances of whitespace and replace with nothing
            // FYI .replace(/W/g, "") means find any instances of non-Alphanumeric and replace with nothing
            var tmpComic = {
                "_id": tmpID3 + $valInNumber + $valInYear,
                "title": $valInTitle,
                "number": $valInNumber,
                "year": $valInYear,
                "publisher": $valInPublisher,
                "notes": $valInNotes,
                "uniqueid": $valInTitle.replace(/\W/g, "").toUpperCase() + $valInNumber + $valInYear,
                "barcode": $valInBarcode,
                "photo": $valInPhoto
            }; // END of tmpComic JSON Object

            console.log(tmpComic);
            // After bunding the data, return it to Global Scope
            return tmpComic;

        } // END fnPrepComic()

        // Function to save the Comic data to the Database
        function fnSaveComic(event) {
            // Prevent the default Form behavor of refreshing the screen
            event.preventDefault();
            console.log("fnSaveComic(event) is running");
            // Run the fnPrepComic() function, it returns a bundle of data
            // which we can use in this function (fnSaveComic()).
            var aComic = fnPrepComic();
            console.log("Comic to be saved is " + aComic);

            db.put(aComic, function (failure, success) {
                if (failure) {
                    console.log("failed to save comic: " + failure);
                    // Depending on failure Code, do something
                    switch (failure.status) {
                        case 409:
                            console.log("_id Already exists!");
                            // Seems the data is 'the same', so we first retreave
                            // the data that exits to Compare if it's the same
                            // as the data we are trying to save
                            db.get(aComic._id, function (failure, success) {
                                if (failure) {
                                    console.log("_id doesn't exist! " + failure); 
                                } else {
                                    console.log("Unique ID already in DB: " + success.uniqueid);
                                    console.log("Unique ID trying to save to DB: " + aComic.uniqueid);
                                    // If the exact comic already exist, tell the user
                                    // Or if it's simply a conflict _id, generate a new, unique _id
                                    if (success.uniqueid === aComic.uniqueid) {
                                        alert("You already saved this comic!");
                                    } else {
                                        console.log("Generating a new _id...");
                                        var idTMP = aComic._id,
                                            idTMPRandom = Math.round(Math.random() * 999);
                                        aComic._id = idTMP + idTMPRandom;
                                        db.put(aComic);
                                        // Prep the Div with the message, to behave like a PopUP
                                        $("#popComicSaved").popup();
                                        // Then, Open the Div, with a Slide-up transition (animation)
                                        $("#popComicSaved").popup("open", { "transition": "slideup" });
                                        // After successfully save the comic, Refresh and View table
                                        fnShowComicsPrep();
                                    } // END if..Else checking Unique IDs
                                } // END if..Else to compare
                            }); // END .get90 to compare the existant data vs new data
                            break;
                        case 412:
                            console.log("_id Already exists!");
                            break;
                        default:
                            console.log("Unknown error: " + failure.status);
                            break;
                    } //END switch() dealing with Error Code
                } else {
                    console.log("Saved comic! " + success.rev + " " + success.ok);
                    // Clear the Save Comic Form after successful saving of comic
                    $elFormSaveComic[0].reset();
                    // Prep the Div with the message, to behave like a PopUP
                    $("#popComicSaved").popup();
                    // Then, Open the Div, with a Slide-up transition (animation)
                    $("#popComicSaved").popup("open", { "transition": "slideup" });
                    fnShowComicsPrep();
                } // END if..Else trying to put data into DB
            }); // END .put()
        } // END fnSaveComic(event)

        // Function to (prepare to) display the comics
        function fnShowComicsPrep() {
            console.log("fnShowComicsPrep() running");

             // To get one Document
            // db.get("ID");
            // To get All Documents
            // db.allDocs();

            // Get all Comics, in Alpha order (A-Z), including
            // each Field of the Doc 9"title", "year", etc)
            db.allDocs({ "ascending": true, "include_docs": true }, function(failure, success){
                if(failure) {
                    console.log("Error retrieving from the Db: " + failure);
                } else {
                    // Successfully getting data
                    //console.log(success.row[0].doc.year);
                    console.log("Raw Array data: " + success.rows);
                    // Pass the data to the Function to display as a Table
                    fnShowComicsTable(success.rows);
                } // END if..Else if the Operation worked, or not
            }); // END .allDocs() retreiving the initial Comic data
        } // END fnShowComicsPrep

        // Function that takes the raw data passed to it, and build a Table to show
        function fnShowComicsTable(data) {
            // Create an Object that begins our HTML Paragraph & Table
            var str = "<p><table border='1'>";
            //var str = "<p><table>";

                // Then add to the Object a Row that includes the Headings of the Table
            str += "<tr> <th>Title</th> <th>#</th> <th>Info</th> </tr>";

                // Show each entry of data here:
                // Using a For Loop, we will iterate through the data
                // Set up our Variable to Increment with. And start at 0
                // As long as the Index is less that (excluding) 4, keep looping
                // Increment the Index by one
                // When i is equal to or greater than the Max #, we stop
                // Set Max # to the .length Property of the Data, so it always
                // knows how many times to loop, on its own
                for (var i = 0; i < data.length; i++) {
                    // str += "<tr><td>Comic 1</td> <td>Number 1</td> <td>Info 1</td></tr>";
                    // str += "<tr><td>data[0].doc.title</td> <td>data[0].doc.number</td> <td>&#x1F4AC;</td></tr>";
                    // data-xxxxxx is an HTML5 concept that we can use to
                    // sort 'link' any arbitrary data with another
                    str += "<tr data-id='" + data[i].doc._id + "'><td>" + data[i].doc.title + "</td> <td>" + data[i].doc.number + "</td> <td class='btnShowComicsInfo'>&#x1F4AC;</td></tr>";

                } // END For Loop

                // Then, END THE <TABLE> and <P>
                str += "</table></p>";

                // In the Div in the HTML file, use .html() Method to write the Comic info
                $elDivShowComicsTable.html(str);
        } // END fnShowComicsTable(data)

        function fnDeleteCollection() {
            console.log("fnDeleteCollection is running");
            // Confirm with the user, twice, if they really want to delete their collection
            switch (confirm("You are about to delete your whole collection. \nConfirm?")) {
                case true:
                    console.log("They wish to delete!");
                    if (confirm("Are you sure..?")) {
                        console.log("Second confirmation, about to DELETE");
                        // PouchDB Method to delete the Db from the device
                        db.destroy(function (failure, success) {
                            if (failure) {
                                console.log("Error deleting Pouch! " + failure);
                                alert("ERROR \nContact the developer: dontcare@trashcan.org");
                            } else {
                                console.log("Pouch deleted! " + success);
                                alert("Your mom threw out your comics successfully!");
                                // Old Db is gone, so reinitialize a new one.
                                initDB();
                                //Then redraw the table with no comics
                                fnShowComicsPrep();
                            } // END if..Else checking if Db was actually deleted
                        }); // END .destroy()
                    } else {
                        console.log("Second time chickening out");

                    } // END if..Else confirming a Second time to delete
                    break;
                case false:
                    console.log("They changed their minds.");
                    break;
                default:
                    console.log("Third possibility");
                    break;

            } // END switch to confirm database deletion
        } // END fnDeleteCollection()

        // Function to show the full info the comic we clicked on
        function fnShowComicsInfo(thisComic) {
            console.log("fnShowComicsInfo() is running");
            console.log(thisComic);
            // Variable to store which comic we're talking about, based on _id
            // .data() reads/writes data-* in an HTML Node
            var tmpComic = thisComic.data("id");
            console.log("This <tr> has a data-id of " + tmpComic);
            // Also pass this info to the Global Scope
            tmpComicToDelete = tmpComic;

            // After storing the particular comic's _id, we then use it to retreave
            // the full data from PouchDB
            db.get(tmpComic, function (failure, success) {
                if (failure) {
                    console.log("Couldn't show this comic: " + tmpComic + " " + failure);
                } else {
                    console.log("Showing comic: " + success.title);
                    // Write the Comic's properties in the paragraphs of the popup
                    // Select a Paragraph inside a Div, equaling the Index number (from zero)
                    $("#divViewComicsInfo p:eq(0)").html("<strong>Name: </strong>" + success.title);
                    $("#divViewComicsInfo p:eq(1)").html("Number: " + success.number);
                    $("#divViewComicsInfo p:eq(2)").html("Year: " + success.year);
                    $("#divViewComicsInfo p:eq(3)").html("Publisher: " + success.publisher);
                    $("#divViewComicsInfo p:eq(4)").html("Notes: " + success.notes); 
                    $("#divViewComicsInfo p:eq(5)").html("Barcode: " + success.barcode);
                    // Note difference!
                    // Select an <img> in a <p> (the 7th paragraph), in a <div>
                    // then set the src Attribute to the path to the photo
                    $("#divViewComicsInfo p:eq(6) img").attr("src", success.photo);                    
                    // Then display the <section> as popup
                    $(":mobile-pagecontainer").pagecontainer("change", "#popViewComicsInfo", {"role":"dialog"});
                } // END if..Else for .get()
            }); // END .get()
        }  // END ffnShowComicsInfo(thisComic)

        // Function to delete a comic, after you view its Info popup
        function fnDeleteComic() {
            console.log("fnDeleteComic() is running");
            console.log("Comic about to delete is: " + tmpComicToDelete);
            // First check that the comic in Question exists
            db.get(tmpComicToDelete, function (failure, success) {
                if (failure) {
                    console.log("ERROR! Comic does exist: " + failure);
                } else {
                    switch (confirm("About to delete this comic. \nAre you syre?")) {
                        case true:
                            db.remove(success, function (failure, success) {
                                if (failure) {
                                    console.log("Failed to delete the comic: " + failure);
                                } else {
                                    console.log("Delete the comic: " + success.ok);
                                    // After deletion, redraw the Table
                                    fnShowComicsPrep();
                                    // Also close the current popup
                                    $("#popViewComicsInfo").dialog("close");
                                } // END If..Else .remove()
                            }); // END .remove
                            break;
                        case false:
                            console.log("Cancelled deletion");
                            break;
                        default:
                            console.log("Third choice ...");
                            break;
                    } // END swith() to confirm deletion
                } // END If..Else of .get()
            }); // END .get()
        } // END fnDeleteComic()

        // Function that preps us to edit the comic in question
        function fnEditComicPrep() {
            console.log("fnEditComicPrep() is running. About to edit: " + tmpComicToDelete);

            //Get the Fields of the Comic selected, and populate the Form,
            // so the user can change any or all of them
            db.get(tmpComicToDelete, function (failure, success) {
                if (failure) {
                    console.log("Error getting this comic from Pouch: " + failure);                
                } else {
                    // Set the value of each of the Edit Input Fields
                    // to what is currently in PouchDB.
                    $("#inTitleEdit").val(success.title);
                    $("#inNumberEdit").val(success.number);
                    $("#inYearEdit").val(success.year);
                    $("#inPublisherEdit").val(success.publisher);
                    $("#inNotesEdit").val(success.notes);
                    $("#inBarcodeEdit").val(success.barcode);
                } // END If..Else for .get() 
            }); // END .get()
            // After populating the fields, display the screen where we can edit those fields
            $(":mobile-pagecontainer").pagecontainer("change", "#popEditComicsInfo", {"role":"dialog"});
        } // END fnEditComicPrep()

        function fnEditComicCancel() {
            $("#popEditComicsInfo").dialog("close");
        } // END fnEditComicCancel() 

        function fnFormEditComicsInfo(event) {
            event.preventDefault();
            console.log("fnFormEditComicsInfo() is running");

            var $valInTitleEdit     = $("#inTitleEdit").val(),
                $valInNumberEdit    = $("#inNumberEdit").val(),
                $valInYearEdit      = $("#inYearEdit").val(),
                $valInPublisherEdit = $("#inPublisherEdit").val(),
                $valInNotesEdit     = $("#inNotesEdit").val(),
                $valInBarcodeEdit = $("#inBarcodeEdit").val();
            // Just to be safe, what's the old data we're about to change? 
            console.log("Old data: ",
                $valInTitleEdit, $valInNumberEdit, $valInYearEdit,
                $valInPublisherEdit, $valInNotesEdit, $valInBarcodeEdit
            );

            // Get the comic in question so we know which new revision to create
            db.get(tmpComicToDelete, function (failure, success) {
                if (failure) {
                    console.log("Error in getting the comic to edit it: " + failure);
                } else {
                    /* After confirming the comic in question exists,
                       re-insert into PouchDB with new (or same) values,
                       PLUS a new REVISION Field. Make sure you use success._rev
                    */
                    db.put({
                        "_id": success._id,
                        "title": $valInTitleEdit,
                        "number": $valInNumberEdit,
                        "year": $valInYearEdit,
                        "publisher": $valInPublisherEdit,
                        "notes": $valInNotesEdit,
                        "barcode": $valInBarcodeEdit,
                        "_rev": success._rev
                    }, function (failure, success) {
                        if (failure) {
                            console.log("Error in Updating the comic: " + failure);
                        } else {
                            console.log("Successfully updaed the comic! " + success.ok);
                            // After successfully updating the data in Pouch, first redraw
                            // the Info Screen, then the Comics Table
                            $("#divViewComicsInfo p:eq(0)").html("<strong>Name: </strong>" + $valInTitleEdit);
                            $("#divViewComicsInfo p:eq(1)").html("Number: " + $valInNumberEdit);
                            $("#divViewComicsInfo p:eq(2)").html("Year: " + $valInYearEdit);
                            $("#divViewComicsInfo p:eq(3)").html("Publisher: " + $valInPublisherEdit);
                            $("#divViewComicsInfo p:eq(4)").html("Notes: " + $valInNotesEdit); 
                            $("#divViewComicsInfo p:eq(5)").html("Barcode: " + $valInBarcodeEdit);
                            $("#popEditComicsInfo").dialog("close");
                            fnShowComicsPrep();
                        } // END If..Else .put()
                    }); // END .put()
                } // END If.. Else of .get()              
            }); // END .get()
        } // END fnFormEditComicsInfo(event)

        //3rd-party plugin to scan barcodes. Docs:
        // https://github.com/phonegap/phonegap-plugin-barcodescanner

        function fnScanBarcode() {
            console.log("fnScanBarcode() is running");

            // Syntax: cordova.plugins.barcodeScanner.scan(success Callback, failure Callback, options);
            cordova.plugins.barcodeScanner.scan(
                function (success) {
                    console.log("type of barcode: " + success.format);
                    console.log("Data in the barcode: " + success.text);
                    // Set the value of the Input Field with the data we just scanned
                    $("#inBarcode").val(success.text);
                }, 
                function (failure) { alert("Scanning failed! " + failure); },
                {
                    "prompt": "Place the comic's barcode in the scan area",
                    "resultDisplayDuration": 2000,
                    "orientation": "landscape",
                    "disableSuccessBeep": false
                }
            ); // END .scan()
        } // END fnScanBarcode()

        // Function to take a photo of the comic
        function fnTakePhoto() {
            console.log("fnTakePhoto() is running");
            // http://cordova.apache.org
            // navigator.camera.getPicture(success Callback, failure Callback, options);
            navigator.camera.getPicture(
                function (success) {
                    console.log("got photo! " + success);
                    $("#inPhoto").val(success);
                },
                function (failure) { alert("Photo failure! " + failure); },
                {
                    "quality": 5,
                    "saveToPhotoAlbum": true,
                    "targetWidth": 768,
                    "targetHeight": 1024
                }
            ); // END .getPicture()

        } // fnTakePhoto()

        // Event Listener when a person clicks Submit in the Save Comic Form
        $elFormSaveComic.submit(function (event) { fnSaveComic(event); });
        // Event Listener to run a Function to Delete Db
        $elBtnDeleteCollection.on("click", fnDeleteCollection);
        // Event listener to show the Info Popup
        // var $elBtnThing = $("#btnThing");             //jQuery selecting ONE ID element
        // var $elBtnManyThings = $(".btnManyThings");   //jQuery selecting MANY Class elements
        // Code bellow doesn't work because, #1 it is selecting HTML nodes that don't exist on runtime
        // #2 WHICH of the rows of comic data does it refer to ??
        // $(".btnShowComicsInfo").on("click", fnShowComicsInfo);
        // Instead, first target an existing Node 9element), then target the specified Node (element)
        // then run a function, where we pass in the specific row (using $(this) Selector),
        // more specifically, the parent Element of where we clicked on.
        $elDivShowComicsTable.on("click", ".btnShowComicsInfo",
            function () { fnShowComicsInfo($(this).parent()); });
        // Event listener to delete a particular comic
        $elBtnDeleteComic.on("click", fnDeleteComic);

        $elBtnEditComicPrep.on("click", fnEditComicPrep);
        $elBtnEditComicCancel.on("click", fnEditComicCancel);
        $elFormEditComicsInfo.submit(function (event) { fnFormEditComicsInfo(event); });

        $elBtnScanBarcode.on("click", fnScanBarcode);
        $elBtnTakePhoto.on("click", fnTakePhoto);
        // ----- PouchDB Code END ----- ??

        // ----- EVENT LISTENERS ----- //
        // Plain old javascript:
        // elFormSignUp.addEventListener("submit");
        // Modern jQuery way:
        $elFormSignUp.submit(function (event) { fnSignUp(event); });
        $elFormLogIn.submit(function (event) { fnLogIn(event); });
        // jQM Method .on() which listens for any Event
        // then runs a function, fnLogOut()  (parens NOT used)
        $elBtnLogOut.on("click", fnLogOut);
       
    } // END onDeviceReady()

    function onPause() {
        // TODO: This application has been suspended. Save application state here.
        console.log("We exited the app");
    }

    function onResume() {
        // TODO: This application has been reactivated. Restore application state here.
        console.log("We returned to the app");
    }

    function onBackKeyDown(event) {
        console.log("Trying to press the Back Button");
        event.preventDefault();
    } //END onBackKeyDown()
} )();