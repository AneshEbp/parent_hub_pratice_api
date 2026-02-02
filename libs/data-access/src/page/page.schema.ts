import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { PageStatus, PageType } from './page.enum';

/**
 * SeoTag represents the SEO metadata for a page.
 * This includes the title, meta tags, and description which are crucial
 * for search engine optimization.
 */
export class SeoTag {
  /**
   * The SEO title for the page, which will be displayed in search engine results.
   *
   * @type {string}
   */
  @Prop({ required: true })
  title: string;

  /**
   * A comma-separated list of meta tags for SEO purposes.
   * These tags help search engines understand the context and content of the page.
   *
   * @type {string}
   */
  @Prop({ required: true })
  tags: string;

  /**
   * A meta description of the page's content.
   * This is often displayed in search engine results and helps improve click-through rates.
   *
   * @type {string}
   */
  @Prop({ required: true })
  description: string;
}

/**
 * The Page schema represents the structure and metadata of a web page.
 * It includes fields such as title, SEO tags, content, page type, slug, and status.
 */
@Schema({ timestamps: true })
export class Page {
  /**
   * The title of the page, which is used both for display purposes and in search engine results.
   *
   * @type {string}
   */
  @Prop({ required: true, type: String, unique: false })
  title: string;

  /**
   * The SEO tags associated with the page, which include the SEO title, meta tags, and description.
   *
   * @type {SeoTag}
   */
  @Prop({ type: () => SeoTag })
  seoTags: SeoTag;

  /**
   * The type of the page, which defines what kind of content is hosted on the page.
   * This can include various page types such as blogs, landing pages, product pages, etc.
   *
   * @type {PageType}
   */
  @Prop({ required: true, type: String })
  pageType: PageType;

  /**
   * A unique slug for the page, used to identify the page in the URL.
   * This must be unique to ensure proper routing.
   *
   * @type {string}
   */
  @Prop({ required: true, unique: true })
  slug: string;

  /**
   * The main content of the page, which may consist of HTML or plain text.
   * This content is displayed to the users visiting the page.
   *
   * @type {string}
   */
  @Prop({ required: true })
  content: string;

  /**
   * Optional version number for tracking different iterations of the page content.
   * This is useful in version control for content management.
   *
   * @type {string}
   */
  @Prop()
  version: string;

  /**
   * The current status of the page, indicating if the page is active, inactive, or archived.
   * The default value is `ACTIVE`.
   *
   * @type {PageStatus}
   */
  @Prop({ type: String, default: PageStatus.ACTIVE })
  status: PageStatus;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: null })
  deletedAt: Date;
}

/**
 * A type representing a document based on the Page class,
 * extending it with additional properties from mongoose documents.
 *
 * @typedef {PageDocument}
 */
export type PageDocument = mongoose.Document & Page;

/**
 * The Mongoose schema for the Page class, defining the structure
 * of the documents in the pages collection of the database.
 */
export const PageSchema = SchemaFactory.createForClass(Page);
