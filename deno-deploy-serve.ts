import {serveDir} from 'jsr:@std/http@1/file-server'

Deno.serve((req) => serveDir(req, {fsRoot: 'dist'}))
