const express = require("express");
const router = express();   
const controller = require("../controllers/emplyoee-controller");

router.get("/employees",controller.AllEmployee);
router.get("/achievers-employees",controller.AllAchieversEmployee);

router.get("/emp/:category/:quarter",controller.Employee);//same as below
router.get("/tab/:category/:quarter", controller.manageTab)//

router.get("/empID/:empid",controller.EmplyoeeWithId);
router.get("/employee/:empid/:category/:quarter", controller.FindAnEmplyoee);

router.get("/download/:quarter", controller.AllEmployeeWithQuarter); //this is donwload button


router.post("/add",controller.AddEmplyoee);
router.post("/addtab",controller.AddTab);

router.delete("/delete/:empid/:category/:quarter",controller.DeleteEmplyoee);
router.delete("/tab/:category/:quarter",controller.DeleteTab);

router.put("/edit/:empid/:category/:quarter", controller.ModifyEmployee);

router.put("/publish/:activeQuarter", controller.publishquarter)

module.exports = router;