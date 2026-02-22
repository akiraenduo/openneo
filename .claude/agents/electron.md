Electron Logo
GitHub Actions Build Status Electron Discord Invite

📝 Available Translations: 🇨🇳 🇧🇷 🇪🇸 🇯🇵 🇷🇺 🇫🇷 🇺🇸 🇩🇪. View these docs in other languages on our Crowdin project.

The Electron framework lets you write cross-platform desktop applications using JavaScript, HTML and CSS. It is based on Node.js and Chromium and is used by the Visual Studio Code and many other apps.

Follow @electronjs on Twitter for important announcements.

This project adheres to the Contributor Covenant code of conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to coc@electronjs.org.

Installation
To install prebuilt Electron binaries, use npm. The preferred method is to install Electron as a development dependency in your app:

npm install electron --save-dev
For more installation options and troubleshooting tips, see installation. For info on how to manage Electron versions in your apps, see Electron versioning.

Platform support
Each Electron release provides binaries for macOS, Windows, and Linux.

macOS (Monterey and up): Electron provides 64-bit Intel and Apple Silicon / ARM binaries for macOS.
Windows (Windows 10 and up): Electron provides ia32 (x86), x64 (amd64), and arm64 binaries for Windows. Windows on ARM support was added in Electron 5.0.8. Support for Windows 7, 8 and 8.1 was removed in Electron 23, in line with Chromium's Windows deprecation policy.
Linux: The prebuilt binaries of Electron are built on Ubuntu 22.04. They have also been verified to work on:
Ubuntu 18.04 and newer
Fedora 32 and newer
Debian 10 and newer
Electron Fiddle
Use Electron Fiddle to build, run, and package small Electron experiments, to see code examples for all of Electron's APIs, and to try out different versions of Electron. It's designed to make the start of your journey with Electron easier.

Resources for learning Electron
electronjs.org/docs - All of Electron's documentation
electron/fiddle - A tool to build, run, and package small Electron experiments
electronjs.org/community#boilerplates - Sample starter apps created by the community
Programmatic usage
Most people use Electron from the command line, but if you require electron inside your Node app (not your Electron app) it will return the file path to the binary. Use this to spawn Electron from Node scripts:

const electron = require('electron')
const proc = require('node:child_process')

// will print something similar to /Users/maf/.../Electron
console.log(electron)

// spawn Electron
const child = proc.spawn(electron)
Mirrors
China
See the Advanced Installation Instructions to learn how to use a custom mirror.

Documentation translations
We crowdsource translations for our documentation via Crowdin. We currently accept translations for Chinese (Simplified), French, German, Japanese, Portuguese, Russian, and Spanish.

Performance
Developers frequently ask about strategies to optimize the performance of Electron applications. Software engineers, consumers, and framework developers do not always agree on one single definition of what "performance" means. This document outlines some of the Electron maintainers' favorite ways to reduce the amount of memory, CPU, and disk resources being used while ensuring that your app is responsive to user input and completes operations as quickly as possible. Furthermore, we want all performance strategies to maintain a high standard for your app's security.

Wisdom and information about how to build performant websites with JavaScript generally applies to Electron apps, too. To a certain extent, resources discussing how to build performant Node.js applications also apply, but be careful to understand that the term "performance" means different things for a Node.js backend than it does for an application running on a client.

This list is provided for your convenience – and is, much like our security checklist – not meant to be exhaustive. It is probably possible to build a slow Electron app that follows all the steps outlined below. Electron is a powerful development platform that enables you, the developer, to do more or less whatever you want. All that freedom means that performance is largely your responsibility.

Measure, Measure, Measure
The list below contains a number of steps that are fairly straightforward and easy to implement. However, building the most performant version of your app will require you to go beyond a number of steps. Instead, you will have to closely examine all the code running in your app by carefully profiling and measuring. Where are the bottlenecks? When the user clicks a button, what operations take up the brunt of the time? While the app is simply idling, which objects take up the most memory?

Time and time again, we have seen that the most successful strategy for building a performant Electron app is to profile the running code, find the most resource-hungry piece of it, and to optimize it. Repeating this seemingly laborious process over and over again will dramatically increase your app's performance. Experience from working with major apps like Visual Studio Code or Slack has shown that this practice is by far the most reliable strategy to improve performance.

To learn more about how to profile your app's code, familiarize yourself with the Chrome Developer Tools. For advanced analysis looking at multiple processes at once, consider the Chrome Tracing tool.

Recommended Reading
Analyze runtime performance
Talk: "Visual Studio Code - The First Second"
Checklist: Performance recommendations
Chances are that your app could be a little leaner, faster, and generally less resource-hungry if you attempt these steps.

Carelessly including modules
Loading and running code too soon
Blocking the main process
Blocking the renderer process
Unnecessary polyfills
Unnecessary or blocking network requests
Bundle your code
Call Menu.setApplicationMenu(null) when you do not need a default menu
1. Carelessly including modules
Before adding a Node.js module to your application, examine said module. How many dependencies does that module include? What kind of resources does it need to simply be called in a require() statement? You might find that the module with the most downloads on the NPM package registry or the most stars on GitHub is not in fact the leanest or smallest one available.

Why?
The reasoning behind this recommendation is best illustrated with a real-world example. During the early days of Electron, reliable detection of network connectivity was a problem, resulting in many apps using a module that exposed a simple isOnline() method.

That module detected your network connectivity by attempting to reach out to a number of well-known endpoints. For the list of those endpoints, it depended on a different module, which also contained a list of well-known ports. This dependency itself relied on a module containing information about ports, which came in the form of a JSON file with more than 100,000 lines of content. Whenever the module was loaded (usually in a require('module') statement), it would load all its dependencies and eventually read and parse this JSON file. Parsing many thousands lines of JSON is a very expensive operation. On a slow machine it can take up whole seconds of time.

In many server contexts, startup time is virtually irrelevant. A Node.js server that requires information about all ports is likely actually "more performant" if it loads all required information into memory whenever the server boots at the benefit of serving requests faster. The module discussed in this example is not a "bad" module. Electron apps, however, should not be loading, parsing, and storing in memory information that it does not actually need.

In short, a seemingly excellent module written primarily for Node.js servers running Linux might be bad news for your app's performance. In this particular example, the correct solution was to use no module at all, and to instead use connectivity checks included in later versions of Chromium.

How?
When considering a module, we recommend that you check:

the size of dependencies included
the resources required to load (require()) it
the resources required to perform the action you're interested in
Generating a CPU profile and a heap memory profile for loading a module can be done with a single command on the command line. In the example below, we're looking at the popular module request.

node --cpu-prof --heap-prof -e "require('request')"

Executing this command results in a .cpuprofile file and a .heapprofile file in the directory you executed it in. Both files can be analyzed using the Chrome Developer Tools, using the Performance and Memory tabs respectively.

Performance CPU Profile

Performance Heap Memory Profile

In this example, on the author's machine, we saw that loading request took almost half a second, whereas node-fetch took dramatically less memory and less than 50ms.

2. Loading and running code too soon
If you have expensive setup operations, consider deferring those. Inspect all the work being executed right after the application starts. Instead of firing off all operations right away, consider staggering them in a sequence more closely aligned with the user's journey.

In traditional Node.js development, we're used to putting all our require() statements at the top. If you're currently writing your Electron application using the same strategy and are using sizable modules that you do not immediately need, apply the same strategy and defer loading to a more opportune time.

Why?
Loading modules is a surprisingly expensive operation, especially on Windows. When your app starts, it should not make users wait for operations that are currently not necessary.

This might seem obvious, but many applications tend to do a large amount of work immediately after the app has launched - like checking for updates, downloading content used in a later flow, or performing heavy disk I/O operations.

Let's consider Visual Studio Code as an example. When you open a file, it will immediately display the file to you without any code highlighting, prioritizing your ability to interact with the text. Once it has done that work, it will move on to code highlighting.

How?
Let's consider an example and assume that your application is parsing files in the fictitious .foo format. In order to do that, it relies on the equally fictitious foo-parser module. In traditional Node.js development, you might write code that eagerly loads dependencies:

parser.js
const fs = require('node:fs')

const fooParser = require('foo-parser')

class Parser {
  constructor () {
    this.files = fs.readdirSync('.')
  }

  getParsedFiles () {
    return fooParser.parse(this.files)
  }
}

const parser = new Parser()

module.exports = { parser }

In the above example, we're doing a lot of work that's being executed as soon as the file is loaded. Do we need to get parsed files right away? Could we do this work a little later, when getParsedFiles() is actually called?

parser.js
// "fs" is likely already being loaded, so the `require()` call is cheap
const fs = require('node:fs')

class Parser {
  async getFiles () {
    // Touch the disk as soon as `getFiles` is called, not sooner.
    // Also, ensure that we're not blocking other operations by using
    // the asynchronous version.
    this.files = this.files || await fs.promises.readdir('.')

    return this.files
  }

  async getParsedFiles () {
    // Our fictitious foo-parser is a big and expensive module to load, so
    // defer that work until we actually need to parse files.
    // Since `require()` comes with a module cache, the `require()` call
    // will only be expensive once - subsequent calls of `getParsedFiles()`
    // will be faster.
    const fooParser = require('foo-parser')
    const files = await this.getFiles()

    return fooParser.parse(files)
  }
}

// This operation is now a lot cheaper than in our previous example
const parser = new Parser()

module.exports = { parser }

In short, allocate resources "just in time" rather than allocating them all when your app starts.

3. Blocking the main process
Electron's main process (sometimes called "browser process") is special: It is the parent process to all your app's other processes and the primary process the operating system interacts with. It handles windows, interactions, and the communication between various components inside your app. It also houses the UI thread.

Under no circumstances should you block this process and the UI thread with long-running operations. Blocking the UI thread means that your entire app will freeze until the main process is ready to continue processing.

Why?
The main process and its UI thread are essentially the control tower for major operations inside your app. When the operating system tells your app about a mouse click, it'll go through the main process before it reaches your window. If your window is rendering a buttery-smooth animation, it'll need to talk to the GPU process about that – once again going through the main process.

Electron and Chromium are careful to put heavy disk I/O and CPU-bound operations onto new threads to avoid blocking the UI thread. You should do the same.

How?
Electron's powerful multi-process architecture stands ready to assist you with your long-running tasks, but also includes a small number of performance traps.

For long running CPU-heavy tasks, make use of worker threads, consider moving them to the BrowserWindow, or (as a last resort) spawn a dedicated process.

Avoid using the synchronous IPC and the @electron/remote module as much as possible. While there are legitimate use cases, it is far too easy to unknowingly block the UI thread.

Avoid using blocking I/O operations in the main process. In short, whenever core Node.js modules (like fs or child_process) offer a synchronous or an asynchronous version, you should prefer the asynchronous and non-blocking variant.

4. Blocking the renderer process
Since Electron ships with a current version of Chrome, you can make use of the latest and greatest features the Web Platform offers to defer or offload heavy operations in a way that keeps your app smooth and responsive.

Why?
Your app probably has a lot of JavaScript to run in the renderer process. The trick is to execute operations as quickly as possible without taking away resources needed to keep scrolling smooth, respond to user input, or animations at 60fps.

Orchestrating the flow of operations in your renderer's code is particularly useful if users complain about your app sometimes "stuttering".

How?
Generally speaking, all advice for building performant web apps for modern browsers apply to Electron's renderers, too. The two primary tools at your disposal are currently requestIdleCallback() for small operations and Web Workers for long-running operations.

requestIdleCallback() allows developers to queue up a function to be executed as soon as the process is entering an idle period. It enables you to perform low-priority or background work without impacting the user experience. For more information about how to use it, check out its documentation on MDN.

Web Workers are a powerful tool to run code on a separate thread. There are some caveats to consider – consult Electron's multithreading documentation and the MDN documentation for Web Workers. They're an ideal solution for any operation that requires a lot of CPU power for an extended period of time.

5. Unnecessary polyfills
One of Electron's great benefits is that you know exactly which engine will parse your JavaScript, HTML, and CSS. If you're re-purposing code that was written for the web at large, make sure to not polyfill features included in Electron.

Why?
When building a web application for today's Internet, the oldest environments dictate what features you can and cannot use. Even though Electron supports well-performing CSS filters and animations, an older browser might not. Where you could use WebGL, your developers may have chosen a more resource-hungry solution to support older phones.

When it comes to JavaScript, you may have included toolkit libraries like jQuery for DOM selectors or polyfills like the regenerator-runtime to support async/await.

It is rare for a JavaScript-based polyfill to be faster than the equivalent native feature in Electron. Do not slow down your Electron app by shipping your own version of standard web platform features.

How?
Operate under the assumption that polyfills in current versions of Electron are unnecessary. If you have doubts, check caniuse.com and check if the version of Chromium used in your Electron version supports the feature you desire.

In addition, carefully examine the libraries you use. Are they really necessary? jQuery, for example, was such a success that many of its features are now part of the standard JavaScript feature set available.

If you're using a transpiler/compiler like TypeScript, examine its configuration and ensure that you're targeting the latest ECMAScript version supported by Electron.

6. Unnecessary or blocking network requests
Avoid fetching rarely changing resources from the internet if they could easily be bundled with your application.

Why?
Many users of Electron start with an entirely web-based app that they're turning into a desktop application. As web developers, we are used to loading resources from a variety of content delivery networks. Now that you are shipping a proper desktop application, attempt to "cut the cord" where possible and avoid letting your users wait for resources that never change and could easily be included in your app.

A typical example is Google Fonts. Many developers make use of Google's impressive collection of free fonts, which comes with a content delivery network. The pitch is straightforward: Include a few lines of CSS and Google will take care of the rest.

When building an Electron app, your users are better served if you download the fonts and include them in your app's bundle.

How?
In an ideal world, your application wouldn't need the network to operate at all. To get there, you must understand what resources your app is downloading - and how large those resources are.

To do so, open up the developer tools. Navigate to the Network tab and check the Disable cache option. Then, reload your renderer. Unless your app prohibits such reloads, you can usually trigger a reload by hitting Cmd + R or Ctrl + R with the developer tools in focus.

The tools will now meticulously record all network requests. In a first pass, take stock of all the resources being downloaded, focusing on the larger files first. Are any of them images, fonts, or media files that don't change and could be included with your bundle? If so, include them.

As a next step, enable Network Throttling. Find the drop-down that currently reads Online and select a slower speed such as Fast 3G. Reload your renderer and see if there are any resources that your app is unnecessarily waiting for. In many cases, an app will wait for a network request to complete despite not actually needing the involved resource.

As a tip, loading resources from the Internet that you might want to change without shipping an application update is a powerful strategy. For advanced control over how resources are being loaded, consider investing in Service Workers.

7. Bundle your code
As already pointed out in "Loading and running code too soon", calling require() is an expensive operation. If you are able to do so, bundle your application's code into a single file.

Why?
Modern JavaScript development usually involves many files and modules. While that's perfectly fine for developing with Electron, we heavily recommend that you bundle all your code into one single file to ensure that the overhead included in calling require() is only paid once when your application loads.

How?
There are numerous JavaScript bundlers out there and we know better than to anger the community by recommending one tool over another. We do however recommend that you use a bundler that is able to handle Electron's unique environment that needs to handle both Node.js and browser environments.

As of writing this article, the popular choices include Webpack, Parcel, and rollup.js.

8. Call Menu.setApplicationMenu(null) when you do not need a default menu
Electron will set a default menu on startup with some standard entries. But there are reasons your application might want to change that and it will benefit startup performance.

Why?
If you build your own menu or use a frameless window without native menu, you should tell Electron early enough to not setup the default menu.

How?
Call Menu.setApplicationMenu(null) before app.on("ready"). This will prevent Electron from setting a default menu. See also https://github.com/electron/electron/issues/35512 for a related discussion.

Security
Reporting security issues
For information on how to properly disclose an Electron vulnerability, see SECURITY.md.

For upstream Chromium vulnerabilities: Electron keeps up to date with alternating Chromium releases. For more information, see the Electron Release Timelines document.

Preface
As web developers, we usually enjoy the strong security net of the browser — the risks associated with the code we write are relatively small. Our websites are granted limited powers in a sandbox, and we trust that our users enjoy a browser built by a large team of engineers that is able to quickly respond to newly discovered security threats.

When working with Electron, it is important to understand that Electron is not a web browser. It allows you to build feature-rich desktop applications with familiar web technologies, but your code wields much greater power. JavaScript can access the filesystem, user shell, and more. This allows you to build high quality native applications, but the inherent security risks scale with the additional powers granted to your code.

With that in mind, be aware that displaying arbitrary content from untrusted sources poses a severe security risk that Electron is not intended to handle. In fact, the most popular Electron apps (Atom, Slack, Visual Studio Code, etc) display primarily local content (or trusted, secure remote content without Node integration) — if your application executes code from an online source, it is your responsibility to ensure that the code is not malicious.

General guidelines
Security is everyone's responsibility
It is important to remember that the security of your Electron application is the result of the overall security of the framework foundation (Chromium, Node.js), Electron itself, all NPM dependencies and your code. As such, it is your responsibility to follow a few important best practices:

Keep your application up-to-date with the latest Electron framework release. When releasing your product, you’re also shipping a bundle composed of Electron, Chromium shared library and Node.js. Vulnerabilities affecting these components may impact the security of your application. By updating Electron to the latest version, you ensure that critical vulnerabilities (such as nodeIntegration bypasses) are already patched and cannot be exploited in your application. For more information, see "Use a current version of Electron".

Evaluate your dependencies. While NPM provides half a million reusable packages, it is your responsibility to choose trusted 3rd-party libraries. If you use outdated libraries affected by known vulnerabilities or rely on poorly maintained code, your application security could be in jeopardy.

Adopt secure coding practices. The first line of defense for your application is your own code. Common web vulnerabilities, such as Cross-Site Scripting (XSS), have a higher security impact on Electron applications hence it is highly recommended to adopt secure software development best practices and perform security testing.

Isolation for untrusted content
A security issue exists whenever you receive code from an untrusted source (e.g. a remote server) and execute it locally. As an example, consider a remote website being displayed inside a default BrowserWindow. If an attacker somehow manages to change said content (either by attacking the source directly, or by sitting between your app and the actual destination), they will be able to execute native code on the user's machine.

warning
Under no circumstances should you load and execute remote code with Node.js integration enabled. Instead, use only local files (packaged together with your application) to execute Node.js code. To display remote content, use the <webview> tag or a WebContentsView and make sure to disable the nodeIntegration and enable contextIsolation.

Electron security warnings
Security warnings and recommendations are printed to the developer console. They only show up when the binary's name is Electron, indicating that a developer is currently looking at the console.

You can force-enable or force-disable these warnings by setting ELECTRON_ENABLE_SECURITY_WARNINGS or ELECTRON_DISABLE_SECURITY_WARNINGS on either process.env or the window object.

Checklist: Security recommendations
You should at least follow these steps to improve the security of your application:

Only load secure content
Do not enable Node.js integration for remote content
Enable context isolation in all renderers
Enable process sandboxing
Use ses.setPermissionRequestHandler() in all sessions that load remote content
Do not disable webSecurity
Define a Content-Security-Policy and use restrictive rules (i.e. script-src 'self')
Do not enable allowRunningInsecureContent
Do not enable experimental features
Do not use enableBlinkFeatures
<webview>: Do not use allowpopups
<webview>: Verify options and params
Disable or limit navigation
Disable or limit creation of new windows
Do not use shell.openExternal with untrusted content
Use a current version of Electron
Validate the sender of all IPC messages
Avoid usage of the file:// protocol and prefer usage of custom protocols
Check which fuses you can change
Do not expose Electron APIs to untrusted web content
1. Only load secure content
Any resources not included with your application should be loaded using a secure protocol like HTTPS. In other words, do not use insecure protocols like HTTP. Similarly, we recommend the use of WSS over WS, FTPS over FTP, and so on.

Why?
HTTPS has two main benefits:

It ensures data integrity, asserting that the data was not modified while in transit between your application and the host.
It encrypts the traffic between your user and the destination host, making it more difficult to eavesdrop on the information sent between your app and the host.
How?
main.js (Main Process)
// Bad
browserWindow.loadURL('http://example.com')

// Good
browserWindow.loadURL('https://example.com')

index.html (Renderer Process)
<!-- Bad -->
<script crossorigin src="http://example.com/react.js"></script>
<link rel="stylesheet" href="http://example.com/style.css">

<!-- Good -->
<script crossorigin src="https://example.com/react.js"></script>
<link rel="stylesheet" href="https://example.com/style.css">

2. Do not enable Node.js integration for remote content
info
This recommendation is the default behavior in Electron since 5.0.0.

It is paramount that you do not enable Node.js integration in any renderer (BrowserWindow, WebContentsView, or <webview>) that loads remote content. The goal is to limit the powers you grant to remote content, thus making it dramatically more difficult for an attacker to harm your users should they gain the ability to execute JavaScript on your website.

After this, you can grant additional permissions for specific hosts. For example, if you are opening a BrowserWindow pointed at https://example.com/, you can give that website exactly the abilities it needs, but no more.

Why?
A cross-site-scripting (XSS) attack is more dangerous if an attacker can jump out of the renderer process and execute code on the user's computer. Cross-site-scripting attacks are fairly common - and while an issue, their power is usually limited to messing with the website that they are executed on. Disabling Node.js integration helps prevent an XSS from being escalated into a so-called "Remote Code Execution" (RCE) attack.

How?
main.js (Main Process)
// Bad
const mainWindow = new BrowserWindow({
  webPreferences: {
    contextIsolation: false,
    nodeIntegration: true,
    nodeIntegrationInWorker: true
  }
})

mainWindow.loadURL('https://example.com')

main.js (Main Process)
// Good
const mainWindow = new BrowserWindow({
  webPreferences: {
    preload: path.join(app.getAppPath(), 'preload.js')
  }
})

mainWindow.loadURL('https://example.com')

index.html (Renderer Process)
<!-- Bad -->
<webview nodeIntegration src="page.html"></webview>

<!-- Good -->
<webview src="page.html"></webview>

When disabling Node.js integration, you can still expose APIs to your website that do consume Node.js modules or features. Preload scripts continue to have access to require and other Node.js features, allowing developers to expose a custom API to remotely loaded content via the contextBridge API.

3. Enable Context Isolation
info
Context Isolation is the default behavior in Electron since 12.0.0.

Context isolation is an Electron feature that allows developers to run code in preload scripts and in Electron APIs in a dedicated JavaScript context. In practice, that means that global objects like Array.prototype.push or JSON.parse cannot be modified by scripts running in the renderer process.

Electron uses the same technology as Chromium's Content Scripts to enable this behavior.

Even when nodeIntegration: false is used, to truly enforce strong isolation and prevent the use of Node primitives contextIsolation must also be used.

Beware that disabling context isolation for a renderer process by setting nodeIntegration: true also disables process sandboxing for that process. See section below.

info
For more information on what contextIsolation is and how to enable it please see our dedicated Context Isolation document.

4. Enable process sandboxing
info
This recommendation is the default behavior in Electron since 20.0.0.

Additionally, process sandboxing can be enforced for all renderer processes application wide: Enabling the sandbox globally

Disabling context isolation (see above) also disables process sandboxing, regardless of the default, sandbox: false or globally enabled sandboxing!

Sandboxing is a Chromium feature that uses the operating system to significantly limit what renderer processes have access to. You should enable the sandbox in all renderers. Loading, reading or processing any untrusted content in an unsandboxed process, including the main process, is not advised.

info
For more information on what Process Sandboxing is and how to enable it please see our dedicated Process Sandboxing document.

5. Handle session permission requests from remote content
You may have seen permission requests while using Chrome: they pop up whenever the website attempts to use a feature that the user has to manually approve ( like notifications).

The API is based on the Chromium permissions API and implements the same types of permissions.

Why?
By default, Electron will automatically approve all permission requests unless the developer has manually configured a custom handler. While a solid default, security-conscious developers might want to assume the very opposite.

How?
main.js (Main Process)
const { session } = require('electron')

const { URL } = require('node:url')

session
  .defaultSession
  .setPermissionRequestHandler((webContents, permission, callback) => {
    const parsedUrl = new URL(webContents.getURL())

    if (permission === 'notifications') {
      // Approves the permissions request
      callback(true)
    }

    // Verify URL
    if (parsedUrl.protocol !== 'https:' || parsedUrl.host !== 'example.com') {
      // Denies the permissions request
      return callback(false)
    }
  })

Note: session.defaultSession is only available after app.whenReady is called.

6. Do not disable webSecurity
info
This recommendation is Electron's default.

You may have already guessed that disabling the webSecurity property on a renderer process (BrowserWindow, WebContentsView, or <webview>) disables crucial security features.

Do not disable webSecurity in production applications.

Why?
Disabling webSecurity will disable the same-origin policy and set allowRunningInsecureContent property to true. In other words, it allows the execution of insecure code from different domains.

How?
main.js (Main Process)
// Bad
const mainWindow = new BrowserWindow({
  webPreferences: {
    webSecurity: false
  }
})

main.js (Main Process)
// Good
const mainWindow = new BrowserWindow()

index.html (Renderer Process)
<!-- Bad -->
<webview disablewebsecurity src="page.html"></webview>

<!-- Good -->
<webview src="page.html"></webview>

7. Define a Content Security Policy
A Content Security Policy (CSP) is an additional layer of protection against cross-site-scripting attacks and data injection attacks. We recommend that they be enabled by any website you load inside Electron.

Why?
CSP allows the server serving content to restrict and control the resources Electron can load for that given web page. https://example.com should be allowed to load scripts from the origins you defined while scripts from https://evil.attacker.com should not be allowed to run. Defining a CSP is an easy way to improve your application's security.

How?
The following CSP will allow Electron to execute scripts from the current website and from apis.example.com.

// Bad
Content-Security-Policy: '*'

// Good
Content-Security-Policy: script-src 'self' https://apis.example.com

CSP HTTP headers
Electron respects the Content-Security-Policy HTTP header which can be set using Electron's webRequest.onHeadersReceived handler:

main.js (Main Process)
const { session } = require('electron')

session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
      'Content-Security-Policy': ['default-src \'none\'']
    }
  })
})

Note: session.defaultSession is only available after app.whenReady is called.

CSP meta tag
CSP's preferred delivery mechanism is an HTTP header. However, it is not possible to use this method when loading a resource using the file:// protocol. It can be useful in some cases to set a policy on a page directly in the markup using a <meta> tag:

index.html (Renderer Process)
<meta http-equiv="Content-Security-Policy" content="default-src 'none'">

8. Do not enable allowRunningInsecureContent
info
This recommendation is Electron's default.

By default, Electron will not allow websites loaded over HTTPS to load and execute scripts, CSS, or plugins from insecure sources (HTTP). Setting the property allowRunningInsecureContent to true disables that protection.

Loading the initial HTML of a website over HTTPS and attempting to load subsequent resources via HTTP is also known as "mixed content".

Why?
Loading content over HTTPS assures the authenticity and integrity of the loaded resources while encrypting the traffic itself. See the section on only displaying secure content for more details.

How?
main.js (Main Process)
// Bad
const mainWindow = new BrowserWindow({
  webPreferences: {
    allowRunningInsecureContent: true
  }
})

main.js (Main Process)
// Good
const mainWindow = new BrowserWindow({})

9. Do not enable experimental features
info
This recommendation is Electron's default.

Advanced users of Electron can enable experimental Chromium features using the experimentalFeatures property.

Why?
Experimental features are, as the name suggests, experimental and have not been enabled for all Chromium users. Furthermore, their impact on Electron as a whole has likely not been tested.

Legitimate use cases exist, but unless you know what you are doing, you should not enable this property.

How?
main.js (Main Process)
// Bad
const mainWindow = new BrowserWindow({
  webPreferences: {
    experimentalFeatures: true
  }
})

main.js (Main Process)
// Good
const mainWindow = new BrowserWindow({})

10. Do not use enableBlinkFeatures
info
This recommendation is Electron's default.

Blink is the name of the rendering engine behind Chromium. As with experimentalFeatures, the enableBlinkFeatures property allows developers to enable features that have been disabled by default.

Why?
Generally speaking, there are likely good reasons if a feature was not enabled by default. Legitimate use cases for enabling specific features exist. As a developer, you should know exactly why you need to enable a feature, what the ramifications are, and how it impacts the security of your application. Under no circumstances should you enable features speculatively.

How?
main.js (Main Process)
// Bad
const mainWindow = new BrowserWindow({
  webPreferences: {
    enableBlinkFeatures: 'ExecCommandInJavaScript'
  }
})

main.js (Main Process)
// Good
const mainWindow = new BrowserWindow()

11. Do not use allowpopups for WebViews
info
This recommendation is Electron's default.

If you are using <webview>, you might need the pages and scripts loaded in your <webview> tag to open new windows. The allowpopups attribute enables them to create new BrowserWindows using the window.open() method. <webview> tags are otherwise not allowed to create new windows.

Why?
If you do not need popups, you are better off not allowing the creation of new BrowserWindows by default. This follows the principle of minimally required access: Don't let a website create new popups unless you know it needs that feature.

How?
index.html (Renderer Process)
<!-- Bad -->
<webview allowpopups src="page.html"></webview>

<!-- Good -->
<webview src="page.html"></webview>

12. Verify WebView options before creation
A WebView created in a renderer process that does not have Node.js integration enabled will not be able to enable integration itself. However, a WebView will always create an independent renderer process with its own webPreferences.

It is a good idea to control the creation of new <webview> tags from the main process and to verify that their webPreferences do not disable security features.

Why?
Since <webview> live in the DOM, they can be created by a script running on your website even if Node.js integration is otherwise disabled.

Electron enables developers to disable various security features that control a renderer process. In most cases, developers do not need to disable any of those features - and you should therefore not allow different configurations for newly created <webview> tags.

How?
Before a <webview> tag is attached, Electron will fire the will-attach-webview event on the hosting webContents. Use the event to prevent the creation of webViews with possibly insecure options.

main.js (Main Process)
app.on('web-contents-created', (event, contents) => {
  contents.on('will-attach-webview', (event, webPreferences, params) => {
    // Strip away preload scripts if unused or verify their location is legitimate
    delete webPreferences.preload

    // Disable Node.js integration
    webPreferences.nodeIntegration = false

    // Verify URL being loaded
    if (!params.src.startsWith('https://example.com/')) {
      event.preventDefault()
    }
  })
})

Again, this list merely minimizes the risk, but does not remove it. If your goal is to display a website, a browser will be a more secure option.

13. Disable or limit navigation
If your app has no need to navigate or only needs to navigate to known pages, it is a good idea to limit navigation outright to that known scope, disallowing any other kinds of navigation.

Why?
Navigation is a common attack vector. If an attacker can convince your app to navigate away from its current page, they can possibly force your app to open web sites on the Internet. Even if your webContents are configured to be more secure (like having nodeIntegration disabled or contextIsolation enabled), getting your app to open a random web site will make the work of exploiting your app a lot easier.

A common attack pattern is that the attacker convinces your app's users to interact with the app in such a way that it navigates to one of the attacker's pages. This is usually done via links, plugins, or other user-generated content.

How?
If your app has no need for navigation, you can call event.preventDefault() in a will-navigate handler. If you know which pages your app might navigate to, check the URL in the event handler and only let navigation occur if it matches the URLs you're expecting.

We recommend that you use Node's parser for URLs. Simple string comparisons can sometimes be fooled - a startsWith('https://example.com') test would let https://example.com.attacker.com through.

main.js (Main Process)
const { app } = require('electron')

const { URL } = require('node:url')

app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl)

    if (parsedUrl.origin !== 'https://example.com') {
      event.preventDefault()
    }
  })
})

14. Disable or limit creation of new windows
If you have a known set of windows, it's a good idea to limit the creation of additional windows in your app.

Why?
Much like navigation, the creation of new webContents is a common attack vector. Attackers attempt to convince your app to create new windows, frames, or other renderer processes with more privileges than they had before; or with pages opened that they couldn't open before.

If you have no need to create windows in addition to the ones you know you'll need to create, disabling the creation buys you a little bit of extra security at no cost. This is commonly the case for apps that open one BrowserWindow and do not need to open an arbitrary number of additional windows at runtime.

How?
webContents will delegate to its window open handler before creating new windows. The handler will receive, amongst other parameters, the url the window was requested to open and the options used to create it. We recommend that you register a handler to monitor the creation of windows, and deny any unexpected window creation.

main.js (Main Process)
const { app, shell } = require('electron')

app.on('web-contents-created', (event, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    // In this example, we'll ask the operating system
    // to open this event's url in the default browser.
    //
    // See the following item for considerations regarding what
    // URLs should be allowed through to shell.openExternal.
    if (isSafeForExternalOpen(url)) {
      setImmediate(() => {
        shell.openExternal(url)
      })
    }

    return { action: 'deny' }
  })
})

15. Do not use shell.openExternal with untrusted content
The shell module's openExternal API allows opening a given protocol URI with the desktop's native utilities. On macOS, for instance, this function is similar to the open terminal command utility and will open the specific application based on the URI and filetype association.

Why?
Improper use of openExternal can be leveraged to compromise the user's host. When openExternal is used with untrusted content, it can be leveraged to execute arbitrary commands.

How?
main.js (Main Process)
//  Bad
const { shell } = require('electron')

shell.openExternal(USER_CONTROLLED_DATA_HERE)

main.js (Main Process)
//  Good
const { shell } = require('electron')

shell.openExternal('https://example.com/index.html')

16. Use a current version of Electron
You should strive for always using the latest available version of Electron. Whenever a new major version is released, you should attempt to update your app as quickly as possible.

Why?
An application built with an older version of Electron, Chromium, and Node.js is an easier target than an application that is using more recent versions of those components. Generally speaking, security issues and exploits for older versions of Chromium and Node.js are more widely available.

Both Chromium and Node.js are impressive feats of engineering built by thousands of talented developers. Given their popularity, their security is carefully tested and analyzed by equally skilled security researchers. Many of those researchers disclose vulnerabilities responsibly, which generally means that researchers will give Chromium and Node.js some time to fix issues before publishing them. Your application will be more secure if it is running a recent version of Electron (and thus, Chromium and Node.js) for which potential security issues are not as widely known.

How?
Migrate your app one major version at a time, while referring to Electron's Breaking Changes document to see if any code needs to be updated.

17. Validate the sender of all IPC messages
You should always validate incoming IPC messages sender property to ensure you aren't performing actions or sending information to untrusted renderers.

Why?
All Web Frames can in theory send IPC messages to the main process, including iframes and child windows in some scenarios. If you have an IPC message that returns user data to the sender via event.reply or performs privileged actions that the renderer can't natively, you should ensure you aren't listening to third party web frames.

You should be validating the sender of all IPC messages by default.

How?
main.js (Main Process)
// Bad
ipcMain.handle('get-secrets', () => {
  return getSecrets()
})

// Good
ipcMain.handle('get-secrets', (e) => {
  if (!validateSender(e.senderFrame)) return null
  return getSecrets()
})

function validateSender (frame) {
  // Validate the host of the URL using an actual URL parser and an allowlist
  if ((new URL(frame.url)).host === 'electronjs.org') return true
  return false
}

18. Avoid usage of the file:// protocol and prefer usage of custom protocols
You should serve local pages from a custom protocol instead of the file:// protocol.

Why?
The file:// protocol gets more privileges in Electron than in a web browser and even in browsers it is treated differently to http/https URLs. Using a custom protocol allows you to be more aligned with classic web url behavior while retaining even more control about what can be loaded and when.

Pages running on file:// have unilateral access to every file on your machine meaning that XSS issues can be used to load arbitrary files from the users machine. Using a custom protocol prevents issues like this as you can limit the protocol to only serving a specific set of files.

How?
Follow the protocol.handle examples to learn how to serve files / content from a custom protocol.

19. Check which fuses you can change
Electron ships with a number of options that can be useful but a large portion of applications probably don't need. In order to avoid having to build your own version of Electron, these can be turned off or on using Fuses.

Why?
Some fuses, like runAsNode and nodeCliInspect, allow the application to behave differently when run from the command line using specific environment variables or CLI arguments. These can be used to execute commands on the device through your application.

This can let external scripts run commands that they potentially would not be allowed to, but that your application might have the rights for.

How?
@electron/fuses is a module we made to make flipping these fuses easy. Check out the README of that module for more details on usage and potential error cases, and refer to How do I flip fuses? in our documentation.

20. Do not expose Electron APIs to untrusted web content
You should not directly expose Electron's APIs, especially IPC, to untrusted web content in your preload scripts.

Why?
Exposing raw APIs like ipcRenderer.on is dangerous because it gives renderer processes direct access to the entire IPC event system, allowing them to listen for any IPC events, not just the ones intended for them.

To avoid that exposure, we also cannot pass callbacks directly through: The first argument to IPC event callbacks is an IpcRendererEvent object, which includes properties like sender that provide access to the underlying ipcRenderer instance. Even if you only listen for specific events, passing the callback directly means the renderer gets access to this event object.

In short, we want the untrusted web content to only have access to necessary information and APIs.

How?
preload
// Bad
contextBridge.exposeInMainWorld('electronAPI', {
  on: ipcRenderer.on
})

// Also bad
contextBridge.exposeInMainWorld('electronAPI', {
  onUpdateCounter: (callback) => ipcRenderer.on('update-counter', callback)
})

// Good
contextBridge.exposeInMainWorld('electronAPI', {
  onUpdateCounter: (callback) => ipcRenderer.on('update-counter', (_event, value) => callback(value))
})


info
For more information on what contextIsolation is and how to use it to secure your app, please see the Context Isolation document.