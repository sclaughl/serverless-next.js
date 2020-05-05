import { join } from "path";
import fse from "fs-extra";
import execa from "execa";
import Builder from "../src/build";
import { DEFAULT_LAMBDA_CODE_DIR, API_LAMBDA_CODE_DIR } from "../src/build";
import { cleanupDir } from "./test-utils";
import {
  OriginRequestDefaultHandlerManifest,
  OriginRequestApiHandlerManifest
} from "../src/types";

jest.mock("execa");

describe("Builder Tests", () => {
  let fseRemoveSpy: jest.SpyInstance;
  let fseEmptyDirSpy: jest.SpyInstance;
  let defaultBuildManifest: OriginRequestDefaultHandlerManifest;
  let apiBuildManifest: OriginRequestApiHandlerManifest;

  const fixturePath = join(__dirname, "./fixtures/simple-app");
  const outputDir = join(fixturePath, ".test_sls_next_output");

  beforeEach(async () => {
    const mockExeca = execa as jest.Mock;
    mockExeca.mockResolvedValueOnce();

    fseRemoveSpy = jest.spyOn(fse, "remove").mockImplementation(() => {
      return;
    });
    fseEmptyDirSpy = jest.spyOn(fse, "emptyDir");

    const builder = new Builder(fixturePath, outputDir);
    await builder.build();

    defaultBuildManifest = await fse.readJSON(
      join(outputDir, `${DEFAULT_LAMBDA_CODE_DIR}/manifest.json`)
    );

    apiBuildManifest = await fse.readJSON(
      join(outputDir, `${API_LAMBDA_CODE_DIR}/manifest.json`)
    );
  });

  afterEach(() => {
    fseEmptyDirSpy.mockRestore();
    fseRemoveSpy.mockRestore();
    return cleanupDir(outputDir);
  });

  describe("Cleanup", () => {
    it(".next directory is emptied except for cache/ folder", () => {
      expect(fseRemoveSpy).toBeCalledTimes(2);
      expect(fseRemoveSpy).toBeCalledWith(
        join(fixturePath, ".next/serverless")
      );
      expect(fseRemoveSpy).toBeCalledWith(
        join(fixturePath, ".next/prerender-manifest.json")
      );
      expect(fseRemoveSpy).not.toBeCalledWith(join(fixturePath, ".next/cache"));
    });

    it("output directory is cleanup before building", () => {
      expect(fseEmptyDirSpy).toBeCalledWith(
        expect.stringContaining(join(".test_sls_next_output", "default-lambda"))
      );
      expect(fseEmptyDirSpy).toBeCalledWith(
        expect.stringContaining(join(".test_sls_next_output", "api-lambda"))
      );
    });
  });

  describe("Default Handler Manifest", () => {
    it("adds full manifest", () => {
      const {
        publicFiles,
        pages: {
          ssr: { dynamic, nonDynamic },
          html
        }
      } = defaultBuildManifest;

      expect(dynamic).toEqual({
        "/:root": {
          file: "pages/[root].js",
          regex: expect.any(String)
        },
        "/customers/:customer": {
          file: "pages/customers/[customer].js",
          regex: expect.any(String)
        },
        "/customers/:customer/:post": {
          file: "pages/customers/[customer]/[post].js",
          regex: expect.any(String)
        },
        "/customers/:customer/profile": {
          file: "pages/customers/[customer]/profile.js",
          regex: expect.any(String)
        },
        "/customers/:catchAll*": {
          file: "pages/customers/[...catchAll].js",
          regex: expect.any(String)
        }
      });

      expect(nonDynamic).toEqual({
        "/customers/new": "pages/customers/new.js",
        "/": "pages/index.js",
        "/_app": "pages/_app.js",
        "/_document": "pages/_document.js",
        "/404": "pages/404.js"
      });

      expect(html).toEqual({
        nonDynamic: {
          "/terms": "pages/terms.html",
          "/about": "pages/about.html"
        },
        dynamic: {
          "/blog/:post": {
            file: "pages/blog/[post].html",
            regex: expect.any(String)
          }
        }
      });

      expect(publicFiles).toEqual({
        "/favicon.ico": "favicon.ico",
        "/sub/image.png": "sub/image.png",
        "/sw.js": "sw.js"
      });
    });
  });

  describe("API Handler Manifest", () => {
    it("adds full api manifest", () => {
      const {
        apis: { dynamic, nonDynamic }
      } = apiBuildManifest;

      expect(nonDynamic).toEqual({
        "/api/customers": "pages/api/customers.js",
        "/api/customers/new": "pages/api/customers/new.js"
      });
      expect(dynamic).toEqual({
        "/api/customers/:id": {
          file: "pages/api/customers/[id].js",
          regex: expect.any(String)
        }
      });
    });
  });

  describe("Default Handler Artefact Files", () => {
    it("copies build files", async () => {
      expect.assertions(5);

      const files = await fse.readdir(
        join(outputDir, `${DEFAULT_LAMBDA_CODE_DIR}`)
      );
      const pages = await fse.readdir(
        join(outputDir, `${DEFAULT_LAMBDA_CODE_DIR}/pages`)
      );
      const customerPages = await fse.readdir(
        join(outputDir, `${DEFAULT_LAMBDA_CODE_DIR}/pages/customers`)
      );
      const apiDirExists = await fse.pathExists(
        join(outputDir, `${DEFAULT_LAMBDA_CODE_DIR}/pages/api`)
      );
      const compatLayerIncluded = await fse.pathExists(
        join(
          outputDir,
          `${DEFAULT_LAMBDA_CODE_DIR}/node_modules/next-aws-cloudfront/index.js`
        )
      );

      expect(files).toEqual([
        "index.js",
        "manifest.json",
        "node_modules",
        "pages"
      ]);

      expect(compatLayerIncluded).toEqual(true);

      // api pages should not be included in the default lambda
      expect(apiDirExists).toEqual(false);

      // html pages should not be included in the default lambda
      expect(pages).toEqual(["_error.js", "blog.js", "customers"]);
      expect(customerPages).toEqual(["[...catchAll].js", "[post].js"]);
    });
  });

  describe("API Handler Artefact Files", () => {
    it("copies build files", async () => {
      expect.assertions(3);

      const files = await fse.readdir(
        join(outputDir, `${API_LAMBDA_CODE_DIR}`)
      );
      const pages = await fse.readdir(
        join(outputDir, `${API_LAMBDA_CODE_DIR}/pages`)
      );

      const compatLayerIncluded = await fse.pathExists(
        join(
          outputDir,
          `${API_LAMBDA_CODE_DIR}/node_modules/next-aws-cloudfront/index.js`
        )
      );

      expect(compatLayerIncluded).toEqual(true);
      expect(files).toEqual([
        "index.js",
        "manifest.json",
        "node_modules",
        "pages"
      ]);
      expect(pages).toEqual(["_error.js", "api"]);
    });
  });
});
