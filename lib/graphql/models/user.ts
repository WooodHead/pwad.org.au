import {nanoid} from 'nanoid';
import md5Hex from 'md5-hex';
import {ManagementClient, PasswordChangeTicketResponse} from 'auth0';
import isAfter from 'date-fns/isAfter';
import isEmpty from 'lodash/isEmpty';
import {User, ShortList, InvoiceStatus} from '../gen-types';
import sanity from '../../sanity';

const management = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  scope: 'create:user_tickets'
});

/**
 * Fetch User from Sanity
 * @param  id User Id
 * @return    User
 */
export async function getById(id: string): Promise<User> {
  return sanity.fetch(
    `*[_type == "user" && _id == $id][0]{
      _id,
      name,
      email,
      invoiceStatus,
      periodEndDate,
      stripeCustomerId,
      "role": permission.role,
      shortlist[]->{_id,_type,title,hymnNumber}
  }`,
    {id}
  );
}

/**
 * Find the auth0 User in Sanity, and create the Sanity User if they don't exist yet
 *
 * @param  user auth0 User
 * @return      Sanity User
 */
export async function findOrCreate(
  user: Record<string, string>
): Promise<User> {
  let result = await sanity.fetch(
    `*[_type == "user" && email == $email][0]{
      _id,
      name,
      email,
      invoiceStatus,
      periodEndDate,
      stripeCustomerId,
      "role": permission.role,
      shortlist[]->{_id,_type,title,hymnNumber}
  }`,
    {email: user.email}
  );

  if (isEmpty(result)) {
    result = sanity.createIfNotExists({
      _id: md5Hex(user.email),
      _type: 'user',
      name: {
        first: user.given_name,
        last: user.family_name
      },
      email: user.email,
      permission: {
        role: 'public'
      }
    });
  }

  result.hasPaidAccount = hasPaidAccount(result);

  return result;
}

type SubscriptionStatus = {
  email: string;
  invoiceStatus: string;
  stripeCustomerId: string;
  periodEndDate: Date;
};

/**
 * Update the User Stripe information in Sanity
 * @param  email            Stripe email address
 * @param  invoiceStatus    Invoice status
 * @param  stripeCustomerId Stripe Customer Id
 * @param  periodEndDate    Current Subscription end date
 */
export async function updateSubscriptionStatus({
  email,
  invoiceStatus,
  stripeCustomerId,
  periodEndDate
}: SubscriptionStatus): Promise<void> {
  // NOTE: The Stripe email address can be changed by existing customers
  // In that scenario we should use the Stripe Customer Id instead
  // It is safe to use the Stripe email for new customers, as they cannot change it
  const {_id} = await sanity.fetch(
    `*[_type == "user" && (email == $email || stripeCustomerId == $stripeCustomerId)][0]`,
    {
      email,
      stripeCustomerId
    }
  );

  await sanity
    .patch(_id)
    .set({
      stripeCustomerId,
      invoiceStatus,
      periodEndDate: periodEndDate.toISOString()
    })
    .commit();
}

/**
 * Creates an auth0 change password ticket
 * @param  user The current user
 * @param  host The current host
 * @return      The auth0 change password ticket
 */
export async function changePassword(
  user: User,
  host: URL
): Promise<PasswordChangeTicketResponse> {
  const resultUrl = new URL('/my-account', host);
  return management.createPasswordChangeTicket({
    email: user.email,
    result_url: resultUrl.href,
    connection_id: 'con_9pRAt1nFWr5rkyyK'
  });
}

/**
 * Appends the reference to the current users shortlist
 * @param  user      The current user
 * @param  reference The reference to add to the shortlist
 * @return           The user with their updated shortlist
 */
export async function addShortListItem(
  user: User,
  reference: string
): Promise<ShortList[]> {
  const {_id} = user;
  await sanity
    .patch(_id)
    .setIfMissing({shortlist: []})
    .append('shortlist', [
      {
        _key: nanoid(),
        _ref: reference,
        _type: 'reference'
      }
    ])
    .commit();

  const {shortlist} = await getById(_id);

  return shortlist;
}

/**
 * Removes the reference index from current users shortlist
 * @param  user           The current user
 * @param  referenceIndex The current index of the reference item
 * @return                The user with their updated shortlist
 */
export async function removeShortListItem(
  user: User,
  referenceIndex: number
): Promise<ShortList[]> {
  const {_id} = user;
  if (referenceIndex >= 0) {
    await sanity
      .patch(_id)
      .setIfMissing({shortlist: []})
      .insert('replace', `shortlist[${referenceIndex}]`, [])
      .commit();
  }

  const {shortlist} = await getById(_id);
  return shortlist;
}

/**
 * [hasPaidAccount description]
 * @param  user [description]
 * @return      [description]
 */
function hasPaidAccount(user: User): boolean {
  const periodEndDate = new Date(user.periodEndDate);
  const hasPaidInvoice = user.invoiceStatus === InvoiceStatus.Paid;
  const isWithinInvoicePeriod = isAfter(periodEndDate, Date.now());

  return hasPaidInvoice && isWithinInvoicePeriod;
}
