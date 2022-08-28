/** @param {NS} ns */
// PHASE 2: THE GROWNING
// THIS PHASE FOCUSES ON GROWING THE SERVER TO FULL CAPACITY,
// WHILE SIMULTANEOUSLY WEAKENING IT BACK TO THE MINIMUM 
// SECURITY LEVEL, TO GET THE IDEAL GROWTH PARAMETER PER
// CYCLE. 

// USAGE NOTE: THIS PHASE WILL RUN AUTOMATICALLY AFTER RUNNING
// THE PHASE 1 SCRIPT, BUT YOU CAN CALL IT MANUALLY WITH
// THE USAGE EXAMPLE BELOW.

// USAGE: run phase2.js TARGET HOSTNAME PORTNUMBER
// EXAMPLE: run phase2.js n00dles home 1
// EXAMPLE SHOWN WILL TARGET n00dles FROM THE HOME SERVER AND
// BROADCAST PHASE TRANSITIONS ON PORT 1

export async function main(ns) {
	var target = ns.args[0]; // Target server name
	var hostName = ns.args[1]; // host server name

	// Port number to use to signal phase transition
	var portNumber = ns.args[2];
	await ns.sleep(135);

	if (ns.getServerMaxMoney(target) == ns.getServerMoneyAvailable(target)) {
		ns.writePort(portNumber, 3);
		ns.exit();
		await ns.sleep(111);
	}

	// RAM needed per grow() and weaken() thread
	var growRAM = 1.75; // Adjust this if the requirements change in the future
	var weakenRAM = 1.75; // Adjust this if the requirements change in the future
	
	// Adding grow/weaken together below since they go hand in hand
	// For 10x grow threads, only 1 weaken thread is needed
	// Since grow increases security only 0.004/thread
	var needRAMx1 = growRAM + weakenRAM; // Updates dynamically cause magic
	var needRAMx10 = (growRAM * 10) + weakenRAM; // Updates dynamically cause magic
	var needRAMx50 = (growRAM * 50) + (weakenRAM * 4); // Updates dynamically cause magic

	// TARGET VARIABLES
	var maxMoney = ns.getServerMaxMoney(target);
	var growParam = ns.getServerGrowth(target);	

	// Threads run, used as iterator
	var runningThreads = 0;
	// Processing threads var
	var processingThreads = true;
	
	while (processingThreads == true) {

		// VARS inside while loop so they remain updated during the loop
		var hostRAM = ns.getServerMaxRam(hostName) - ns.getServerUsedRam(hostName); // Available RAM
		var curMoney = ns.getServerMoneyAvailable(target);
		var moneyMultiplier = maxMoney / curMoney * 1.05; // Divide max / current $
		var growThreads = Math.floor(ns.growthAnalyze(target, moneyMultiplier)) - runningThreads;
		var weakenThreads = Math.floor(growThreads / 5);
		var requiredRAM = (growThreads * growRAM) + (weakenThreads * weakenRAM);

		// Disable logging for sleep and exec functions for easier readability of log windows
		ns.disableLog("sleep");
		ns.disableLog("exec");

		// Clears any logging the prior functions might have output for readability
		ns.clearLog();
		// ns.tail();

		ns.print("* Target: " + target + " Host: " + hostName + " Port #: " + portNumber);
		ns.print("* Target current/max $$$: $" + ns.nFormat(curMoney, "0.00a") + "/$" + ns.nFormat(maxMoney, "0.00a"));
		ns.print("* Growth parameter: " + growParam + " Threads run: " + runningThreads);
		ns.print("* Grow threads needed: " + growThreads + " weakens: " + weakenThreads);
		ns.print("* RAM Avail.: " + hostRAM.toFixed(2) + " RAM Req'd: " + requiredRAM);
		

		if (growThreads >= 50 && hostRAM > needRAMx50) {
            let rt50 = runningThreads + 50;
            ns.exec("1xgrow.js", hostName, 50, target, rt50);
			ns.exec("1xweak.js", hostName, 4, target, rt50);
            runningThreads = rt50;
            await ns.sleep(45);
			continue;
        }
		if (growThreads >= 10 && hostRAM > needRAMx10) {
            let rt10 = runningThreads + 10;
            ns.exec("1xgrow.js", hostName, 10, target, rt10);
			ns.exec("1xweak.js", hostName, 1, target, rt10);
            runningThreads = rt10;
            await ns.sleep(25);
			continue;
        }
        if (growThreads >= 1 && hostRAM > needRAMx1) {
            let rt1 = runningThreads + 1;
            ns.exec("1xgrow.js", hostName, 1, target, rt1);
            runningThreads = rt1;
            await ns.sleep(25);
			continue;
        } 
		if (growThreads > 0 && hostRAM < needRAMx1) {
			// take a breather
			await ns.sleep(1505);
			continue;
		}
		if (growThreads <= 0) {
			// Time to sign off to the post-processing section
			processingThreads = false;
			await ns.sleep(111);
		}

		// Sleep just in case so the while loop doesn't hang
		await ns.sleep(133);
	} // end processingThreads

	var wTime = ns.getWeakenTime(target);
	var finishDelay = wTime / 10.047; //slightly less than 10% for each increment
	var keepAlive = true;

	while (keepAlive || ns.getServerMaxMoney(target) == ns.getServerMoneyAvailable(target)) {
	
		await ns.writePort(portNumber, "P2: 0/100%");
		ns.exec("1xweak.js", hostName, 2, target, "p2");
		
		for (var i=1; i<11; i++) {
			let percentS = i * 10;
			let portSignal = "P2: " + percentS + "/100%";
			await ns.sleep(finishDelay);
			await ns.writePort(portNumber, portSignal);
		}

		ns.print("* Phase 3 incoming, stand by...");
		await ns.sleep(151);
		await ns.writePort(portNumber, 3);
		ns.print("Thanks for playing.");
		await ns.sleep(133);
		keepAlive = false;
		
		if (keepAlive == false) {
			await ns.sleep(111);
			await ns.exit();
			await ns.sleep(111);
		}
				
		// just in case
		await ns.sleep(159);
	}

	//just in case
	await ns.sleep(159);

}