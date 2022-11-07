from flask import Response, request
from flask_restful import Resource
from models import Following, User, db
import json
from views import can_view_post, get_authorized_user_ids
import flask_jwt_extended

def get_path():
    return request.host_url + 'api/posts/'

class FollowingListEndpoint(Resource):
    def __init__(self, current_user):
        self.current_user = current_user
    
    @flask_jwt_extended.jwt_required()
    def get(self):
        # return all of the "following" records that the current user is following
        following = Following.query.filter_by(user_id = self.current_user.id)
        following_json = [follow.to_dict_following() for follow in following]
        return Response(json.dumps(following_json), mimetype="application/json", status=200)

    @flask_jwt_extended.jwt_required()
    def post(self):
        # create a new "following" record based on the data posted in the body 
        body = request.get_json()
        print(body)

        user_id = body.get('user_id')

        # make sure id is int
        try: 
            user_id = int(user_id)
        except:
            return Response(json.dumps({"message": "invalid user id"}), mimetype="application/json", status=400)

        # duplicate
        if user_id in get_authorized_user_ids(self.current_user):
            return Response(json.dumps({"message": "You can follow a person that you already follow"}), mimetype="application/json", status=400)

        user = User.query.get(user_id)
        if not user:
            return Response(json.dumps({"message": "id={0} is not in the database".format(user_id)}), mimetype="application/json", status=404)
        # make sure id number is valid
        # if can_view_post(user_id, self.current_user) == False:
        #     return Response(json.dumps({"message": "invalid user id"}), mimetype="application/json", status=404)


        new_following = Following(
            following_id=user_id,
            user_id=self.current_user.id
        )
        db.session.add(new_following)  
        db.session.commit() 
        return Response(json.dumps(new_following.to_dict_following()), mimetype="application/json", status=201)



class FollowingDetailEndpoint(Resource):
    def __init__(self, current_user):
        self.current_user = current_user
    
    @flask_jwt_extended.jwt_required()
    def delete(self, id):
        # delete "following" record where "id"=id
        print(id)
        following = Following.query.get(id)
        if not following:
            return Response(json.dumps({"message": "Can't delete a user that you don't follow"}), mimetype="application/json", status=404)
        if self.current_user.id == following.user_id:
            Following.query.filter_by(id=id).delete()
            db.session.commit()
            return Response(json.dumps({"message": "User={0} was successfully unfollowed".format(id)}), mimetype="application/json", status=200)
        else: 
            return Response(json.dumps({"message": "Invalid unfollow"}), mimetype="application/json", status=404)



def initialize_routes(api):
    api.add_resource(
        FollowingListEndpoint, 
        '/api/following', 
        '/api/following/', 
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )
    api.add_resource(
        FollowingDetailEndpoint, 
        '/api/following/<int:id>', 
        '/api/following/<int:id>/', 
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )
