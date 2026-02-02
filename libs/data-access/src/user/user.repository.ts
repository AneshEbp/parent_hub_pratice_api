import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepo } from './../repository/base.repo';
import { User, UserDocument } from './user.schema';
import { paginationOptions } from '../repository/pagination.type';
// import { generateSearchRegex } from '@app/common/helpers/genericFunction';
// import { InputValueForUsers } from '@api/modules/appointments/dto/input/user-input.dto';

@Injectable()
export class UsersRepository extends BaseRepo<UserDocument> {
  projection;
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {
    super(userModel);

    /* build projection */
    this.projection = {
      _id: 1,
      authProvider: 1,
      authProviderId: 1,
      firstName: 1,
      lastName: 1,
      address: 1,
      status: 1,
      bio: 1,
      lastLoggedInAt: 1,
      updatedAt: 1,
      createdAt: 1,
    };
  }

  async getAllUsers(pageMeta: paginationOptions, filter: any = {}) {
    return this.findWithPaginate(filter, pageMeta, { ...this.projection, profileImage: 1 });
  }

  /**
   * Gets all distinct phone numbers registered with the application
   * @returns array of objects with phoneNumber property
   */
  async getAllDistinctPhoneNumbers() {
    const stages = [
      { $match: { authProvider: 'phone' } },
      { $group: { _id: '$authProviderId' } },
      { $project: { _id: 0, phoneNumber: '$_id' } },
    ];

    return this.aggregate(stages);
  }

  async getAllUserProfiles(userId: string, meta, sort, searchText = '') {
    console.log(userId, 'userID');
    const stages: any = [
      {
        $match: {
          _id: { $ne: userId },
          status: 'email_verified',
          firstName: { $exists: true, $nin: [null, ''] },
          deletedAt: null,
        },
      },
    ];

    if (searchText) {
      stages.push({
        $addFields: {
          fullName: {
            $concat: ['$firstName', ' ', '$lastName'],
          },
        },
      });
      stages.push({
        $match: {
          fullName: { $regex: searchText, $options: 'i' },
        },
      });
    }
    stages.push({
      $sort: sort,
    });

    stages.push({
      $project: { ...this.projection, profileImage: 1 },
    });

    return this.aggregatePaginate(stages, meta);
  }

  async getUsers(filter = []) {
    const stages = [...filter];

    /* create pipeline */
    stages.push({
      $project: this.projection,
    });

    return this.aggregate(stages);
  }

  // get users list to whom payout has not been applied since last week
  async getUsersWithDuePayment(filter = []) {
    const stages = [...filter];

    stages.push(
      {
        $lookup: {
          from: 'stripecustomers',
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$userId', '$$userId'],
                },
              },
            },
          ],
          as: 'stripecustomer',
        },
      },
      {
        $unwind: '$stripecustomer',
      },
      {
        $project: {
          _id: 1,
          authProviderId: 1,
          stripeCustomerId: '$stripecustomer._id',
          connectedAccountId: '$stripecustomer.paymentDetail.accountId',
        },
      },
    );

    return this.aggregate(stages);
  }

  async findPractitionerForCreateAppointment(_ids: string[]) {
    const practitioners = await this.find(
      { _id: { $in: _ids } },
      {
        _id: 1,
        firstName: 1,
        lastName: 1,
        profileImage: 1,
        authProviderId: 1,
      },
    );

    return practitioners.map((p: any) => ({
      ...p,
      fullName: `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim(),
      email: p.authProviderId ?? null, // map email → authProviderId
      profilePicture: p.profileImage ?? null, // map profilePicture → profileImage
    }));
  }

  // async listStaffsAndClientsForTask(userValue: InputValueForUsers, user: any) {
  //   const { pageMeta, isDependent } = userValue;

  //   if (!user?.businessId) {
  //     throw new UnauthorizedException();
  //   }

  //   const { searchValue, isClient, role, roleArray } = userValue;

  //   let roleCondition: any = {};

  //   if (isClient && (!roleArray || !roleArray?.length)) {
  //     roleCondition = { 'role.role': 'client' };

  //     if (isDependent === true || isDependent === false) {
  //       roleCondition = {
  //         ...roleCondition,
  //         isDependent,
  //       };
  //     }
  //   } else if (role) {
  //     roleCondition = [UserRoles.studentPractitioner, UserRoles.practitioner].includes(
  //       role as UserRoles,
  //     )
  //       ? {
  //           'role.role': UserRoles.practitioner,
  //           isStudentAccount: UserRoles.studentPractitioner === role,
  //         }
  //       : {
  //           'role.role': role,
  //         };
  //   } else {
  //     roleCondition = {
  //       'role.role': { $nin: [UserRoles.client] },
  //     };
  //   }

  //   if (roleArray?.length) {
  //     roleCondition = { 'role.role': { $in: roleArray } };
  //   }

  //   const filter = [];

  //   if (searchValue && searchValue != '') {
  //     const searchRegex = generateSearchRegex(searchValue);

  //     const matchQueryForSearchText = {
  //       $or: [
  //         {
  //           fullName: {
  //             $regex: `${searchRegex}`,
  //             $options: 'i',
  //           },
  //         },

  //         {
  //           preferredName: {
  //             $regex: `${searchRegex}`,
  //             $options: 'i',
  //           },
  //         },
  //       ],
  //     };
  //     filter.push({
  //       $match: matchQueryForSearchText,
  //     });
  //   }

  //   const newMatch = userValue.hasPhone
  //     ? {
  //         ...roleCondition,
  //         businessId: user.businessId,
  //         isArchived: { $ne: true },
  //         deletedAt: null,
  //         phone: { $not: { $in: [null, ''] } },
  //       }
  //     : {
  //         ...roleCondition,
  //         businessId: user.businessId,
  //         isArchived: { $ne: true },
  //         deletedAt: null,
  //       };

  //   filter.push(
  //     {
  //       $match: {
  //         ...newMatch,
  //       },
  //     },
  //     {
  //       $addFields: {
  //         firstNameLower: { $toLower: '$firstName' },
  //         lastNameLower: { $toLower: 'lastName' },
  //       },
  //     },
  //     {
  //       $sort: {
  //         firstNameLower: 1,
  //         lastNameLower: 1,
  //       },
  //     },
  //   );

  //   const users = await this.aggregatePaginate(filter, pageMeta);

  //   const data = users.data.map((user) => {
  //     user.role = user?.role?.role;
  //     return user;
  //   });

  //   return { data, pagination: users.pagination };
  // }
}
